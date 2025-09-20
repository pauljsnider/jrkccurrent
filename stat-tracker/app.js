// Soccer Stat Tracker - Main Application
class SoccerStatTracker {
    constructor() {
        this.gameState = {
            timer: { startTime: null, elapsed: 0, isRunning: false },
            currentGameId: null,
            selectedPlayerId: null
        };

        this.roster = [];
        this.gameData = {};

        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.loadData();
        this.bindEvents();
        this.updateDisplay();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/stat-tracker/service-worker.js');
                console.log('Service Worker registered successfully:', registration);

                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('App updated! Refresh to use the new version.');
                        }
                    });
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Data Management
    loadData() {
        try {
            // Load roster
            const savedRoster = localStorage.getItem('soccer-roster');
            if (savedRoster) {
                this.roster = JSON.parse(savedRoster);
            } else {
                // Initialize with default roster if none exists
                this.roster = this.getDefaultRoster();
                this.saveData(); // Save the default roster
            }

            // Load game data
            const savedGameData = localStorage.getItem('soccer-game-data');
            this.gameData = savedGameData ? JSON.parse(savedGameData) : {};

            // Load timer state
            const savedTimer = localStorage.getItem('soccer-timer');
            if (savedTimer) {
                this.gameState.timer = JSON.parse(savedTimer);
                // Resume timer if it was running
                if (this.gameState.timer.isRunning) {
                    this.gameState.timer.startTime = Date.now() - this.gameState.timer.elapsed;
                }
            }

            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading saved data', 'error');
        }
    }

    getDefaultRoster() {
        // Junior Current team roster with assigned jersey numbers
        return [
            { id: '1', name: 'Audrey', jersey: 9, position: 'Striker' },
            { id: '2', name: 'Payton', jersey: 10, position: 'Midfielder' },
            { id: '3', name: 'Teagan', jersey: 4, position: 'Center Back' },
            { id: '4', name: 'Neda', jersey: 1, position: 'Goalkeeper' },
            { id: '5', name: 'Saavya', jersey: 8, position: 'Midfield' },
            { id: '6', name: 'Livy', jersey: 5, position: 'Defender' },
            { id: '7', name: 'Madison', jersey: 11, position: 'Forward' },
            { id: '8', name: 'Riley', jersey: 7, position: 'Midfield' },
            { id: '9', name: 'Harper', jersey: 6, position: 'Forward' },
            { id: '10', name: 'Vivian', jersey: 3, position: 'Defender' },
            { id: '11', name: 'Emmie', jersey: 2, position: 'Midfielder' },
            { id: '12', name: 'Sela', jersey: 12, position: 'Midfielder' }
        ];
    }

    saveData() {
        try {
            localStorage.setItem('soccer-roster', JSON.stringify(this.roster));
            localStorage.setItem('soccer-game-data', JSON.stringify(this.gameData));
            localStorage.setItem('soccer-timer', JSON.stringify(this.gameState.timer));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });

        // Timer controls
        document.getElementById('start-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopTimer());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetTimer());

        // Roster management
        document.getElementById('add-player-btn').addEventListener('click', () => this.showAddPlayerForm());
        document.getElementById('cancel-add').addEventListener('click', () => this.hideAddPlayerForm());
        document.getElementById('player-form').addEventListener('submit', (e) => this.savePlayer(e));

        // Modal
        document.getElementById('close-modal').addEventListener('click', () => this.closeStatModal());
        document.getElementById('save-stats').addEventListener('click', () => this.savePlayerStats());

        // Settings
        document.getElementById('export-email-btn').addEventListener('click', () => this.exportEmail());
        document.getElementById('clear-game-btn').addEventListener('click', () => this.clearGameData());
        document.getElementById('clear-roster-btn').addEventListener('click', () => this.clearRoster());

        // Notes character count
        const notesTextarea = document.getElementById('player-notes');
        if (notesTextarea) {
            notesTextarea.addEventListener('input', () => this.updateNotesCount());
        }

        // Star rating
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => this.setStarRating(parseInt(e.target.dataset.value)));
        });

        // Modal backdrop click
        document.getElementById('stat-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stat-modal') {
                this.closeStatModal();
            }
        });
    }

    // Navigation
    switchPage(pageId) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.page === pageId);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `${pageId}-page`);
        });

        // Update displays when switching
        if (pageId === 'game') {
            this.renderPlayersGrid();
        } else if (pageId === 'roster') {
            this.renderRosterList();
        }
    }

    // Timer Management
    startTimer() {
        if (!this.gameState.timer.isRunning) {
            this.gameState.timer.startTime = Date.now() - this.gameState.timer.elapsed;
            this.gameState.timer.isRunning = true;

            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;

            this.timerInterval = setInterval(() => this.updateTimer(), 100);
            this.saveData();
            this.showNotification('Game timer started');
        }
    }

    stopTimer() {
        if (this.gameState.timer.isRunning) {
            this.gameState.timer.isRunning = false;
            clearInterval(this.timerInterval);

            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;

            this.saveData();
            this.showNotification('Game timer stopped');

            // Offer to export game summary
            setTimeout(() => {
                if (confirm('Game stopped. Would you like to email the game summary?')) {
                    this.exportEmail();
                }
            }, 1000);
        }
    }

    resetTimer() {
        if (confirm('Reset timer? This will clear the current game time.')) {
            this.gameState.timer = { startTime: null, elapsed: 0, isRunning: false };
            clearInterval(this.timerInterval);

            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;

            this.updateTimer();
            this.saveData();
            this.showNotification('Timer reset');
        }
    }

    updateTimer() {
        if (this.gameState.timer.isRunning) {
            this.gameState.timer.elapsed = Date.now() - this.gameState.timer.startTime;
        }

        const totalSeconds = Math.floor(this.gameState.timer.elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }

    // Player Management
    showAddPlayerForm() {
        document.getElementById('add-player-form').classList.remove('hidden');
        document.getElementById('player-name').focus();
    }

    hideAddPlayerForm() {
        document.getElementById('add-player-form').classList.add('hidden');
        document.getElementById('player-form').reset();
    }

    savePlayer(e) {
        e.preventDefault();

        const name = document.getElementById('player-name').value.trim();
        const jersey = document.getElementById('jersey-number').value;

        if (!name) {
            this.showNotification('Player name is required', 'error');
            return;
        }

        // Check for duplicate jersey numbers
        if (jersey && this.roster.some(p => p.jersey === parseInt(jersey))) {
            this.showNotification('Jersey number already in use', 'error');
            return;
        }

        const player = {
            id: Date.now().toString(),
            name: name,
            jersey: jersey ? parseInt(jersey) : null
        };

        this.roster.push(player);
        this.saveData();
        this.hideAddPlayerForm();
        this.renderRosterList();
        this.renderPlayersGrid();
        this.showNotification('Player added successfully');
    }

    removePlayer(playerId) {
        if (confirm('Remove this player from the roster?')) {
            this.roster = this.roster.filter(p => p.id !== playerId);
            delete this.gameData[playerId];
            this.saveData();
            this.renderRosterList();
            this.renderPlayersGrid();
            this.showNotification('Player removed');
        }
    }

    // Display Updates
    updateDisplay() {
        console.log('Updating display with roster:', this.roster.length, 'players');

        this.updateTimer();
        this.renderPlayersGrid();
        this.renderRosterList();

        // Set initial button states
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');

        if (startBtn && stopBtn) {
            startBtn.disabled = this.gameState.timer.isRunning;
            stopBtn.disabled = !this.gameState.timer.isRunning;
        }

        // Start timer interval if running
        if (this.gameState.timer.isRunning) {
            this.timerInterval = setInterval(() => this.updateTimer(), 100);
        }
    }

    renderPlayersGrid() {
        const grid = document.getElementById('players-grid');

        if (!grid) {
            console.error('Players grid not found');
            return;
        }

        console.log('Rendering players grid with roster:', this.roster);

        if (this.roster.length === 0) {
            grid.innerHTML = `
                <div class="no-players">
                    <p>No players found.</p>
                    <p>Go to <strong>Roster</strong> to add players.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.roster.map(player => {
            const hasStats = this.gameData[player.id] && Object.keys(this.gameData[player.id]).length > 0;
            const jerseyText = player.jersey ? `#${player.jersey}` : '';
            const displayName = jerseyText ? `${jerseyText} ${player.name}` : player.name;

            return `
                <div class="player-card ${hasStats ? 'has-stats' : ''}" onclick="statTracker.openStatModal('${player.id}')">
                    <div class="player-stats-indicator"></div>
                    <div class="player-name">${displayName}</div>
                    <div class="player-jersey">${player.position || ''}</div>
                </div>
            `;
        }).join('');
    }

    renderRosterList() {
        const list = document.getElementById('roster-list');

        if (!list) {
            console.error('Roster list not found');
            return;
        }

        console.log('Rendering roster list with roster:', this.roster);

        if (this.roster.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No players added yet.</p>';
            return;
        }

        list.innerHTML = this.roster.map(player => {
            const jerseyText = player.jersey ? `Jersey #${player.jersey}` : 'No jersey number';
            const positionText = player.position ? ` • ${player.position}` : '';

            return `
                <div class="roster-item">
                    <div class="roster-item-info">
                        <div class="roster-item-name">${player.name}</div>
                        <div class="roster-item-jersey">${jerseyText}${positionText}</div>
                    </div>
                    <div class="roster-item-actions">
                        <button class="btn btn-small btn-secondary" onclick="statTracker.removePlayer('${player.id}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Stat Modal
    openStatModal(playerId) {
        this.gameState.selectedPlayerId = playerId;
        const player = this.roster.find(p => p.id === playerId);

        if (!player) return;

        // Update modal title
        const jerseyText = player.jersey ? `#${player.jersey} ` : '';
        document.getElementById('modal-player-name').textContent = `${jerseyText}${player.name}`;

        // Load existing stats
        const stats = this.gameData[playerId] || {};
        this.updateStatCounts(stats);

        // Load notes
        document.getElementById('player-notes').value = stats.notes || '';
        this.updateNotesCount();

        // Show modal
        document.getElementById('stat-modal').classList.remove('hidden');
    }

    closeStatModal() {
        document.getElementById('stat-modal').classList.add('hidden');
        this.gameState.selectedPlayerId = null;
    }

    updateStatCounts(stats) {
        // Update stat counts
        document.getElementById('goals-count').textContent = (stats.goals || []).length;
        document.getElementById('assists-count').textContent = (stats.assists || []).length;
        document.getElementById('blocks-count').textContent = (stats.blocks || []).length;
        document.getElementById('hustle-count').textContent = (stats.hustle || []).length;

        // Update star rating
        this.displayStarRating(stats.stars || 0);
    }

    // Utility Functions
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');

        text.textContent = message;
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    updateNotesCount() {
        const textarea = document.getElementById('player-notes');
        const counter = document.getElementById('notes-count');
        const length = textarea.value.length;

        counter.textContent = length;

        if (length > 200) {
            counter.style.color = '#dc2626';
            textarea.value = textarea.value.substring(0, 200);
            counter.textContent = '200';
        } else {
            counter.style.color = '#6b7280';
        }
    }

    setStarRating(value) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }

    displayStarRating(value) {
        this.setStarRating(value);
    }

    // Placeholder functions for future implementation
    savePlayerStats() {
        // This will be implemented in later tasks
        this.showNotification('Stats saved (placeholder)');
        this.closeStatModal();
    }

    exportEmail() {
        // This will be implemented when EmailJS is integrated
        this.showNotification('Email export (placeholder)');
    }

    clearGameData() {
        if (confirm('Clear all game data? This cannot be undone.')) {
            this.gameData = {};
            this.saveData();
            this.renderPlayersGrid();
            this.showNotification('Game data cleared');
        }
    }

    clearRoster() {
        if (confirm('Clear roster? This will also clear all game data.')) {
            this.roster = [];
            this.gameData = {};
            this.saveData();
            this.renderRosterList();
            this.renderPlayersGrid();
            this.showNotification('Roster cleared');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear existing data for testing (uncomment this line to reset data)
    localStorage.removeItem('soccer-roster');
    localStorage.removeItem('soccer-game-data');
    localStorage.removeItem('soccer-timer');

    window.statTracker = new SoccerStatTracker();

    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
        window.statTracker.updateDisplay();
    }, 100);
});

// Handle page visibility changes (for timer accuracy)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.statTracker) {
        window.statTracker.updateTimer();
    }
});