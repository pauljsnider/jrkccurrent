/**
 * Junior Current current-roster rendering.
 * AllPlays controls membership, names, numbers, and current photos. The local
 * profile copy below is only an editorial overlay for returning players.
 */

const legacyPlayerProfiles = {
    Neda: {
        position: 'Goalkeeper',
        secondaryPosition: 'Center Back',
        description: 'Calm under pressure, Neda brings focus and power to the goal box with confident decision-making.',
        positionCategory: 'goalkeeper',
        photoUrl: 'Images/roster/neda.jpg'
    },
    Emmie: {
        position: 'Midfielder',
        secondaryPosition: 'Forward',
        description: 'Tireless and selfless, Emmie is everywhere—pressing, passing, and leading by example.',
        positionCategory: 'midfielder',
        photoUrl: 'Images/roster/emmie.jpg'
    },
    Vivian: {
        position: 'Defender',
        secondaryPosition: 'Midfielder',
        description: 'Composed and reliable, Vivian reads the game well and provides solid defensive coverage with smart positioning.',
        positionCategory: 'defender',
        photoUrl: 'Images/roster/vivian.png'
    },
    Teagan: {
        position: 'Center Back',
        secondaryPosition: 'Goalkeeper',
        description: 'Solid and steady, Teagan is the backbone of the defense and leads with quiet strength.',
        positionCategory: 'defender',
        photoUrl: 'Images/roster/tegan.jpg'
    },
    Livy: {
        position: 'Defender',
        secondaryPosition: 'Midfielder',
        description: 'Steady and thoughtful, Livy supports her teammates with smart play and strong positioning.',
        positionCategory: 'defender',
        photoUrl: 'Images/roster/livi.jpg'
    },
    Riley: {
        position: 'Midfield',
        secondaryPosition: 'Striker',
        description: 'Creative and confident, Riley brings flair and rhythm to the field with her footwork and movement.',
        positionCategory: 'midfielder',
        photoUrl: 'Images/roster/riley.jpg'
    },
    Saavya: {
        position: 'Midfield',
        secondaryPosition: 'Utility Player',
        description: 'A true team player, Saavya can step into any position with composure and grit.',
        positionCategory: 'midfielder',
        photoUrl: 'Images/roster/saavya.jpg'
    },
    Audrey: {
        position: 'Striker',
        secondaryPosition: 'Forward',
        description: 'Fierce, focused, and fearless in front of goal, Audrey brings a striker\'s mentality and sharp instincts.',
        positionCategory: 'forward',
        photoUrl: 'Images/roster/audry.jpg'
    },
    Payton: {
        position: 'Midfielder',
        secondaryPosition: 'Winger',
        description: 'A visionary playmaker, Payton sees passing lanes others miss and sets the tempo for the team.',
        positionCategory: 'midfielder',
        photoUrl: 'Images/roster/payton.jpg'
    },
    Madison: {
        position: 'Forward',
        secondaryPosition: 'Midfielder',
        description: 'Energetic and vocal, Madison pushes the team forward with her relentless pace and presence.',
        positionCategory: 'forward',
        photoUrl: 'Images/roster/madison.jpg'
    },
    Sela: {
        position: 'Midfielder',
        secondaryPosition: 'Goalkeeper',
        description: 'Smart and intuitive, Sela has a game sense that allows her to shine in key moments.',
        positionCategory: 'midfielder',
        photoUrl: 'Images/roster/Sela.jpg'
    }
};

const profileNameByPlayerId = Object.freeze({
    '3i8gNO9PDkymlzyxTWfb': 'Saavya',
    'L0oSkcksF9GzC78I2owh': 'Emmie',
    'LsDbznWzPtljxHPsOUNq': 'Teagan',
    'N4yJ1YDOFpr0r02DuBuM': 'Sela',
    'PFkgAkMl7bdJsGBgyLph': 'Riley',
    'YSOQNbUcl1wBv8xp40Qx': 'Neda',
    'dreR528YQ9geSUZASnGq': 'Vivian',
    'iziPOcQpijDCrxKJ4NNe': 'Madison',
    'nbbf0uTCafODYiP0siEL': 'Audrey',
    'qJ5BLRZ1XXzeCyZxsLgn': 'Livy',
    'snRmz9GMkmoqc8sCaN2x': 'Payton'
});

let currentPlayers = [];
let activePositionFilter = 'all';

function inferPositionCategory(position) {
    const text = String(position || '').toLowerCase();
    if (text.includes('goal')) return 'goalkeeper';
    if (text.includes('back') || text.includes('defend')) return 'defender';
    if (text.includes('mid')) return 'midfielder';
    if (text.includes('forward') || text.includes('striker') || text.includes('wing')) return 'forward';
    return '';
}

function mergePlayerProfile(player) {
    const profileName = profileNameByPlayerId[player.id];
    const profile = profileName ? legacyPlayerProfiles[profileName] : null;
    const position = player.position || profile?.position || '';
    return {
        ...player,
        photoUrl: player.photoUrl || profile?.photoUrl || null,
        position,
        secondaryPosition: profile?.secondaryPosition || '',
        description: profile?.description || '',
        positionCategory: inferPositionCategory(player.position) || profile?.positionCategory || ''
    };
}

function getPositionIcon(positionCategory) {
    switch (positionCategory) {
        case 'forward':
            return 'fa-person-running';
        case 'midfielder':
            return 'fa-futbol';
        case 'defender':
            return 'fa-shield-halved';
        case 'goalkeeper':
            return 'fa-hands-catching';
        default:
            return 'fa-user';
    }
}

function getPositionColor(positionCategory) {
    switch (positionCategory) {
        case 'forward':
            return 'var(--red)';
        case 'midfielder':
            return 'var(--light-teal)';
        case 'defender':
            return 'var(--navy-blue)';
        case 'goalkeeper':
            return 'var(--dark-teal)';
        default:
            return 'var(--navy-blue)';
    }
}

function appendPlayerPlaceholder(container, player) {
    container.classList.add('player-icon-container');
    container.style.backgroundColor = `${getPositionColor(player.positionCategory)}40`;
    const icon = document.createElement('i');
    icon.className = `fas ${getPositionIcon(player.positionCategory)} player-icon`;
    icon.style.color = getPositionColor(player.positionCategory);
    icon.setAttribute('aria-hidden', 'true');
    container.appendChild(icon);
}

function createPlayerCard(player) {
    const card = document.createElement('article');
    card.className = 'player-card';
    if (player.positionCategory) card.dataset.position = player.positionCategory;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'player-image';
    if (player.photoUrl) {
        const image = document.createElement('img');
        image.src = player.photoUrl;
        image.alt = player.position ? `${player.name} — ${player.position}` : player.name;
        image.className = 'player-photo';
        image.loading = 'lazy';
        image.addEventListener('error', () => {
            image.remove();
            appendPlayerPlaceholder(imageContainer, player);
        }, { once: true });
        imageContainer.appendChild(image);
    } else {
        appendPlayerPlaceholder(imageContainer, player);
    }

    if (player.number) {
        const number = document.createElement('span');
        number.className = 'player-number';
        number.textContent = `#${player.number}`;
        imageContainer.appendChild(number);
    }

    const info = document.createElement('div');
    info.className = 'player-info';
    const name = document.createElement('h3');
    name.className = 'player-name';
    name.textContent = player.name;
    info.appendChild(name);

    const positions = [player.position, player.secondaryPosition].filter(Boolean);
    if (positions.length) {
        const position = document.createElement('p');
        position.className = 'player-position';
        position.textContent = positions.join(' / ');
        info.appendChild(position);
    }
    if (player.description) {
        const description = document.createElement('p');
        description.className = 'player-description';
        description.textContent = player.description;
        info.appendChild(description);
    }

    card.append(imageContainer, info);
    return card;
}

function renderRosterStatus(message, tone = 'loading', includeRetry = false) {
    const status = document.getElementById('roster-status');
    if (!status) return;
    status.className = `data-status data-status-${tone}`;
    status.replaceChildren();
    const text = document.createElement('span');
    text.textContent = message;
    status.appendChild(text);
    if (includeRetry) {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'data-retry';
        retry.textContent = 'Try again';
        retry.addEventListener('click', () => loadCurrentRoster(true));
        status.appendChild(retry);
    }
}

function generatePlayerCards(positionFilter = 'all') {
    const container = document.querySelector('.player-cards');
    if (!container) return;
    container.replaceChildren();
    const filtered = positionFilter === 'all'
        ? currentPlayers
        : currentPlayers.filter((player) => player.positionCategory === positionFilter);
    filtered.forEach((player) => container.appendChild(createPlayerCard(player)));
    if (!filtered.length && currentPlayers.length) {
        const empty = document.createElement('p');
        empty.className = 'data-empty';
        empty.textContent = 'No players are listed at this position.';
        container.appendChild(empty);
    }
}

function updatePositionFilters() {
    const available = new Set(currentPlayers.map((player) => player.positionCategory).filter(Boolean));
    document.querySelectorAll('.roster-filters .filter-btn').forEach((button) => {
        const position = button.dataset.position;
        button.hidden = position !== 'all' && !available.has(position);
    });
}

async function loadCurrentRoster(force = false) {
    const dataClient = window.JRKC_PUBLIC_DATA;
    if (!dataClient) {
        renderRosterStatus('Current roster is temporarily unavailable.', 'error');
        return;
    }
    renderRosterStatus('Loading the current AllPlays roster…', 'loading');
    try {
        const payload = await dataClient.loadRoster({ force });
        currentPlayers = payload.players.map(mergePlayerProfile);
        activePositionFilter = 'all';
        updatePositionFilters();
        document.querySelectorAll('.roster-filters .filter-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.position === 'all');
        });
        generatePlayerCards();
        renderRosterStatus(
            currentPlayers.length
                ? `${currentPlayers.length} current players • Updated from AllPlays`
                : 'No active players are currently listed.',
            currentPlayers.length ? 'success' : 'empty'
        );
    } catch (error) {
        currentPlayers = [];
        generatePlayerCards();
        renderRosterStatus('We could not load the current roster. No archived players are being shown as current.', 'error', true);
        console.error('Failed to load current roster:', error);
    }
}

function initRosterPage() {
    document.querySelectorAll('.roster-filters .filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            activePositionFilter = button.dataset.position || 'all';
            document.querySelectorAll('.roster-filters .filter-btn').forEach((candidate) => {
                candidate.classList.toggle('active', candidate === button);
            });
            generatePlayerCards(activePositionFilter);
        });
    });
    loadCurrentRoster();
}

document.addEventListener('DOMContentLoaded', initRosterPage);
