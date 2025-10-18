# Soccer Stat Tracker

A Progressive Web App (PWA) for real-time soccer game statistics tracking, designed for youth soccer coaches and parents. Built for the Junior Current soccer team.

## Features

### 📊 Real-Time Game Tracking
- **Live Timer**: Game clock with start/stop/reset functionality
- **Player Statistics**: Track goals, assists, saves, and defensive plays
- **Substitutions**: Log player substitutions with timestamps
- **Game Events**: Record key moments and turning points

### 👥 Team Management
- **Roster Management**: Add, edit, and organize team players
- **Player Selection**: Quick player selection for stat recording
- **Position Tracking**: Monitor player positions and playing time

### 📱 Progressive Web App
- **Offline Capability**: Works without internet connection
- **Mobile Optimized**: Designed for tablet and phone use during games
- **Install to Home Screen**: Can be installed as a native app
- **Auto-Save**: Automatic data persistence using localStorage

### 📈 Data Export
- **Game Summary**: Generate comprehensive game reports
- **Statistics Export**: Export data for analysis and match reports
- **Persistent Storage**: All data saved locally on device

## Getting Started

### Installation
1. Navigate to the stat-tracker URL on your mobile device or tablet
2. Tap "Add to Home Screen" when prompted (or use browser menu)
3. The app will install and can be used offline

### Setting Up a Game
1. **Add Players**: Use the roster management to add team players
2. **Start Game**: Tap the timer to begin tracking
3. **Record Stats**: Select players and record their actions during the game
4. **Export Data**: Generate reports at the end of the game

## Usage

### During a Game
1. **Timer Control**: Start/stop the game timer as needed
2. **Quick Stats**: Tap player names to quickly record actions
3. **Event Logging**: Record goals, assists, saves, and other key plays
4. **Substitutions**: Track when players enter/exit the game

### After a Game
1. **Review Stats**: Check all recorded statistics
2. **Export Data**: Generate summary for match reports
3. **Save Game**: Data automatically persists for future reference

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript**: No external dependencies
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: PWA installation and configuration

### Browser Support
- Chrome/Edge 80+
- Safari 13+
- Firefox 75+
- Mobile browsers with PWA support

### Data Storage
- **localStorage**: All data stored locally on device
- **No Server Required**: Fully client-side application
- **Privacy First**: No data transmitted to external servers

## File Structure

```
stat-tracker/
├── index.html          # Main application interface
├── app.js             # Core application logic
├── styles.css         # Application styling
├── manifest.json      # PWA configuration
├── service-worker.js  # Offline functionality
├── offline.html       # Offline fallback page
├── icon-192x192.png   # App icon (small)
├── icon-512x512.png   # App icon (large)
└── favicon.ico        # Browser favicon
```

## Features in Detail

### Game Timer
- Accurate game timing with pause/resume
- Visual timer display
- Automatic time logging for all events

### Player Statistics
- **Goals**: Track who scored and when
- **Assists**: Record players who assisted goals
- **Saves**: Log goalkeeper saves
- **Defensive Plays**: Track blocks, tackles, and clearances

### Data Export
The app generates structured data that can be:
- Copied to clipboard for use in match reports
- Used with AI tools (like ChatGPT) to generate narrative match reports
- Analyzed for player and team performance insights

## Integration with Match Reports

This stat tracker is designed to work seamlessly with AI-powered match report generation:

1. **Record Game**: Use the tracker during the match
2. **Export Data**: Generate structured game data
3. **AI Processing**: Feed data to ChatGPT or similar AI tools
4. **Match Reports**: Generate engaging narratives for parents and players

## Development

### Local Development
1. Clone the repository
2. Serve the stat-tracker directory with a local web server
3. Navigate to `http://localhost:8000/stat-tracker/` (or your local server URL)

### Customization
- **Colors**: Modify CSS variables in the `:root` section
- **Team Info**: Update manifest.json with your team details
- **Features**: Extend app.js with additional tracking capabilities

## Contributing

This is a family project built for the Junior Current soccer team. Feel free to fork and adapt for your own team's needs.

## License

Open source - feel free to use and modify for your youth soccer team.

---

**Built with ❤️ for youth soccer by Madison & Paul Snider**

*Part of the Junior Current team website ecosystem at [jrkccurrent.com](https://jrkccurrent.com)*
