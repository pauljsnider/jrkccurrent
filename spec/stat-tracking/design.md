# Stat-Tracking Design Document

## Overview
The Youth Soccer Stat-Tracking Application is a Progressive Web App (PWA) designed for real-time data collection during youth soccer games. The application prioritizes speed, simplicity, and reliability for coaches operating in potentially limited connectivity environments.

### Key Design Principles
- **Mobile-First**: Optimized for single-handed phone operation during active coaching
- **Real-Time Performance**: Sub-200ms response times for all interactions
- **Offline-Capable**: Robust offline functionality with data persistence
- **Minimal Cognitive Load**: Simple, intuitive interface requiring no training

## Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3 (CSS Grid/Flexbox), Vanilla JavaScript
- **PWA Features**: Service Worker for offline capability, Web App Manifest
- **Storage**: LocalStorage for game data, IndexedDB for roster persistence
- **Email Service**: EmailJS for client-side email sending
- **Deployment**: Static hosting (GitHub Pages, Netlify, or Vercel)

### System Architecture
```mermaid
graph TB
    A[Mobile Browser] --> B[PWA App Shell]
    B --> C[Game Timer Module]
    B --> D[Stat Tracking Module]
    B --> E[Roster Management Module]
    B --> F[Notes Module]

    C --> G[LocalStorage]
    D --> G
    E --> H[IndexedDB]
    F --> G

    G --> I[Email Export Module]
    I --> J[EmailJS Service]
    J --> K[paul@paulsnider.net]

    L[Service Worker] --> B
    L --> M[Cache Storage]
```

## Components

### 1. App Shell Component
**Purpose**: Provides the core application structure and navigation
**Key Features**:
- Fixed header with game timer display
- Bottom navigation bar with primary actions
- Responsive layout adapting to screen orientation

### 2. Game Timer Component
**Purpose**: Tracks game duration and provides timestamps for all stats
**Key Features**:
- Large, prominent timer display (MM:SS format)
- Start/Stop/Reset controls with visual confirmation
- Auto-save timer state to prevent data loss
- Manual time adjustment capability

### 3. Roster Display Component
**Purpose**: Shows all players in an easily scannable grid layout
**Key Features**:
- Compact player cards (4-6 per row on mobile)
- Visual indicators for players with recorded stats
- Quick access to individual player stat entry
- Alphabetical sorting with jersey number display

### 4. Stat Entry Modal Component
**Purpose**: Provides rapid stat entry for selected player
**Key Features**:
- Full-screen modal for focused interaction
- Large tap targets for each stat category (Goals, Assists, Blocks/Saves, Hustle, Stars)
- Visual feedback with haptic response (where supported)
- Quick access to notes entry
- Timestamp display for context

### 5. Notes Component
**Purpose**: Allows free-form text entry for player observations
**Key Features**:
- Auto-expanding textarea with character count
- Voice-to-text integration (where supported)
- Quick phrases/templates for common observations
- Timestamp association with game time

### 6. Email Export Component
**Purpose**: Formats and sends game summary via email
**Key Features**:
- Automatic triggering when game timer stops
- Manual export option in app menu
- Structured email template with game summary
- Error handling with retry mechanism

## Data Models

### Game Session Model
```javascript
{
  gameId: "uuid",
  startTime: "2024-01-15T14:30:00Z",
  endTime: "2024-01-15T15:45:00Z",
  totalDuration: 4500, // seconds
  players: [PlayerStats],
  exported: false,
  createdAt: "2024-01-15T14:29:55Z"
}
```

### Player Stats Model
```javascript
{
  playerId: "uuid",
  playerName: "John Smith",
  jerseyNumber: 7,
  stats: {
    goals: [
      { timestamp: 1200, gameTime: "20:00" },
      { timestamp: 2400, gameTime: "40:00" }
    ],
    assists: [
      { timestamp: 1800, gameTime: "30:00" }
    ],
    blocks: [
      { timestamp: 600, gameTime: "10:00" }
    ],
    hustle: [
      { timestamp: 3000, gameTime: "50:00" }
    ],
    stars: 2 // 1-3 rating
  },
  notes: "Great hustle in second half, needs to work on passing accuracy"
}
```

### Roster Model
```javascript
{
  teamId: "uuid",
  players: [
    {
      playerId: "uuid",
      playerName: "John Smith",
      jerseyNumber: 7,
      position: "Forward"
    }
  ],
  lastUpdated: "2024-01-15T10:00:00Z"
}
```

## Error Handling

### Network Connectivity
- **Offline Detection**: Monitor `navigator.onLine` status
- **Queue Management**: Store failed email attempts for retry when online
- **User Feedback**: Clear offline indicators and sync status

### Data Integrity
- **Auto-Save**: Continuous saving of game state to LocalStorage
- **Validation**: Client-side validation of all data inputs
- **Recovery**: Automatic recovery from corrupted data states

### User Experience
- **Loading States**: Visual feedback for all async operations
- **Error Messages**: Clear, actionable error messages
- **Graceful Degradation**: Core functionality works without network

## UX Research Findings

### GitHub Project Analysis
Research of similar sports tracking applications revealed several key patterns:

**Player Display Conventions**:
- Jersey number + name format (`#7 John Smith`) is widely adopted
- Card-based layouts work well for player selection
- Visual indicators for active players improve usability

**Mobile Touch Patterns**:
- Minimum 44px touch targets for accessibility
- CSS Grid for responsive button layouts
- Large, clearly labeled action buttons
- Simplified navigation with bottom tabs or fixed headers

**Stat Organization**:
- Grouping by category (Offensive, Defensive, Special Teams) improves cognitive flow
- Real-time feedback with visual confirmation (color changes, animations)
- Quick-access patterns for frequently used actions

### Design Validation
These findings validate our design approach:
- Large tap targets for stat entry buttons
- Clear player identification with jersey numbers
- Categorical organization of stats
- Mobile-first responsive design

## Testing Strategy

### Unit Testing
- Game timer accuracy and state management
- Stat entry validation and storage
- Email formatting and template generation
- Data persistence and retrieval functions

### Integration Testing
- EmailJS service integration and error handling
- Service Worker offline functionality
- Cross-browser compatibility (iOS Safari, Android Chrome)
- LocalStorage and IndexedDB operations

### User Acceptance Testing
- Real-world coaching scenario simulation
- Performance testing under stress conditions
- Accessibility compliance (WCAG 2.1 AA)
- Battery usage optimization

### Performance Testing
- Load time optimization (target: <2 seconds)
- Memory usage monitoring
- Network efficiency (minimal data usage)
- Touch response timing (<200ms)

## Security Considerations

### EmailJS Implementation
- Use EmailJS public key (acceptable for this use case)
- Template-based email sending to prevent injection
- Rate limiting through EmailJS service
- No sensitive data exposure in client code

### Data Privacy
- Local-only data storage (no external databases)
- Clear data retention policies
- Option to clear all game data
- No tracking or analytics collection

## Deployment Strategy

### Build Process
- Static file generation for optimal performance
- Service Worker registration and caching strategy
- Progressive enhancement for PWA features
- Minification and compression

### Hosting Requirements
- HTTPS requirement for Service Worker functionality
- Static hosting with global CDN
- Custom domain support for professional appearance
- Automatic deployment from version control

## Future Considerations

### Potential Enhancements
- Team roster synchronization across devices
- Historical game data analysis and trends
- Integration with parent communication platforms
- Multi-language support for international teams
- Advanced analytics and player development tracking

### Scalability Planning
- Database migration path if team management grows
- Multi-team support for club-level coaching
- Integration with existing sports management platforms
- API development for third-party integrations