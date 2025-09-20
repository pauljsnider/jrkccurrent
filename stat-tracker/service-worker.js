// Service Worker for Soccer Stat Tracker
const CACHE_NAME = 'soccer-stats-v1';
const OFFLINE_URL = '/stat-tracker/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
    '/stat-tracker/',
    '/stat-tracker/index.html',
    '/stat-tracker/styles.css',
    '/stat-tracker/app.js',
    '/stat-tracker/manifest.json',
    '/stat-tracker/offline.html'
];

// Install event - cache files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('Service Worker: Files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If network fails, serve cached index.html or offline page
                    return caches.match('/stat-tracker/index.html')
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            return caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    // Handle all other requests with cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache if not a successful response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response before caching
                        const responseClone = networkResponse.clone();

                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed and no cache available
                        // Return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for email sending when back online
self.addEventListener('sync', (event) => {
    if (event.tag === 'email-sync') {
        console.log('Service Worker: Background sync - attempting to send queued emails');
        event.waitUntil(syncQueuedEmails());
    }
});

// Function to sync queued emails
async function syncQueuedEmails() {
    try {
        // Get queued emails from IndexedDB or localStorage
        const queuedEmails = await getQueuedEmails();

        for (const email of queuedEmails) {
            try {
                // Attempt to send email
                await sendEmail(email);

                // Remove from queue if successful
                await removeFromEmailQueue(email.id);

                console.log('Service Worker: Email sent successfully', email.id);
            } catch (error) {
                console.error('Service Worker: Failed to send email', email.id, error);
                // Keep in queue for next sync attempt
            }
        }
    } catch (error) {
        console.error('Service Worker: Error during email sync', error);
    }
}

// Helper function to get queued emails
async function getQueuedEmails() {
    try {
        const emailQueue = localStorage.getItem('emailQueue');
        return emailQueue ? JSON.parse(emailQueue) : [];
    } catch (error) {
        console.error('Service Worker: Error getting email queue', error);
        return [];
    }
}

// Helper function to remove email from queue
async function removeFromEmailQueue(emailId) {
    try {
        const emailQueue = await getQueuedEmails();
        const updatedQueue = emailQueue.filter(email => email.id !== emailId);
        localStorage.setItem('emailQueue', JSON.stringify(updatedQueue));
    } catch (error) {
        console.error('Service Worker: Error removing email from queue', error);
    }
}

// Helper function to send email (placeholder - will be implemented with EmailJS)
async function sendEmail(emailData) {
    // This will be implemented when EmailJS is integrated
    // For now, just simulate an API call
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
    });

    if (!response.ok) {
        throw new Error('Email sending failed');
    }

    return response.json();
}

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'QUEUE_EMAIL') {
        // Queue email for background sync
        queueEmailForSync(event.data.email);
    }
});

// Function to queue email for background sync
async function queueEmailForSync(emailData) {
    try {
        const emailQueue = await getQueuedEmails();
        emailData.id = Date.now().toString();
        emailData.timestamp = new Date().toISOString();

        emailQueue.push(emailData);
        localStorage.setItem('emailQueue', JSON.stringify(emailQueue));

        // Register background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('email-sync');
        }

        console.log('Service Worker: Email queued for sync', emailData.id);
    } catch (error) {
        console.error('Service Worker: Error queueing email', error);
    }
}