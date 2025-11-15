# K-State Wildcats Basketball Stat Tracker

A mobile-friendly, real-time basketball statistics tracking application designed for the Kansas State Wildcats youth basketball team.

## Overview

This stat tracker is a standalone HTML application that allows coaches and parents to track live basketball game statistics on any device. It features the K-State Wildcats branding with their signature purple color scheme.

## Features

### Core Statistics Tracking
- **Points (PTS)**: Quick-add buttons for 1, 2, or 3 points
- **Rebounds (REB)**: Single increment tracking
- **Assists (AST)**: Single increment tracking
- **Steals (STL)**: Single increment tracking
- **Turnovers (TO)**: Single increment tracking
- **Notes**: Per-player text notes with log functionality

### Game Management
- **Live Scoreboard**: Auto-updates as points are scored
- **Period Selector**: Q1, Q2, Q3, Q4, and OT support
- **Game Timer**: Start/Stop/Reset functionality
- **Game Date**: Track the date and opponent name
- **Game Log**: Chronological event log with timestamps

### Team Features
- **Wildcats Roster**: Pre-loaded with 10 players (ordered by jersey number)
- **Opponent Tracking**: Dynamic opponent player addition and stat tracking
- **Complete Stats**: All players included in reports, even with zero stats

### Data & Export
- **localStorage Persistence**: Game state saved automatically
- **Email Summary**: Complete game report with team totals and individual stats
- **Browser Warning**: Alerts before leaving during active games

## K-State Wildcats Theme

### Color Scheme
- **Primary Purple**: `#512888` - K-State's signature purple
- **Dark Purple**: `#3d1f66` - Depth and darker accents
- **Silver**: `#c0c0c0` - Secondary accent
- **Gold**: `#ffc627` - Available for highlights
- **White & Black**: Text and contrast

### Branding Elements
- Purple header and table borders
- White score displays with purple text
- Purple stat buttons and controls
- "Wildcats" team name throughout
- Professional sports aesthetic

## Player Roster

The tracker includes these players (ordered by jersey number):

1. Madison #00
2. Winnie #1
3. Felicity #2
4. Hazel #3
5. Kayla #4
6. Blake #5
7. Emma #10
8. Teagan #15
9. Samantha #22
10. Emersyn #25

## How to Use

### Starting a Game
1. Open `hoops.html` in any web browser
2. Enter the opponent name and game date
3. Select the current period (Q1-Q4 or OT)
4. Click "Start" to begin the game timer

### Tracking Stats During the Game
1. **For Points**: Click 1, 2, or 3 buttons under the PTS column
   - Score automatically updates on the scoreboard
   - Event logged with player name and points
2. **For Other Stats**: Click the + button to increment
3. **To Correct**: Click the - button to decrement
4. **Add Notes**: Type in the notes field and click "Log" to add to game log
5. **Track Opponents**: Add opponent players using "Add Player" button

### Period Management
- Click Q1, Q2, Q3, Q4, or OT buttons to change periods
- Game log timestamps include the current period
- Timer continues running across period changes

### After the Game
1. Click "Stop" to pause the timer
2. Click "Email Summary" to generate a complete game report
3. Email includes:
   - Game information (date, opponent, final score)
   - Team totals for all stats
   - Complete roster with individual stats (all players)
   - Opponent team stats
   - Full game log

## Technical Details

### Technology Stack
- **HTML5**: Single-file application
- **CSS3**: Embedded styles with CSS variables
- **Vanilla JavaScript**: No frameworks required
- **localStorage API**: Automatic data persistence

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure
```
stat-tracker/
├── hoops.html          # Main basketball tracker (standalone)
├── index.html          # Soccer tracker
├── HOOPS-README.md     # This documentation
└── [other files]
```

### Data Persistence
Game state is automatically saved to `localStorage` with these keys:
- `hoops-game-state`: Main game data, scores, stats, log
- `hoops-opponent-roster`: Opponent player list

**Note**: Data persists in the same browser on the same device. Clearing browser data will erase saved games.

## Customization

### Modifying the Player Roster
Edit the `ROSTER` array in `hoops.html` (line ~443):

```javascript
const ROSTER = [
    { id: 6, name: 'Madison', jersey: '00' },
    { id: 1, name: 'Winnie', jersey: 1 },
    // Add or modify players here
];
```

**Important**:
- Each player needs a unique `id`
- Jersey numbers can be strings (for '00') or numbers
- Players display in the order listed

### Changing Colors
Modify CSS variables in the `:root` selector (line ~10):

```css
:root {
    --kstate-purple: #512888;
    --kstate-dark-purple: #3d1f66;
    /* Modify colors here */
}
```

### Adjusting Email Recipient
Change the mailto address in the `emailSummary()` function (line ~1012):

```javascript
const mailto = `mailto:your-email@example.com?subject=...`;
```

### Period Configuration
The default periods are Q1, Q2, Q3, Q4, and OT. To modify:
1. Edit the period buttons in HTML (line ~372)
2. Update the `setPeriod()` function logic if needed

## Mobile Optimization

### Design Features
- **Compact Layout**: Minimal spacing for maximum screen usage
- **Large Tap Targets**: 20px+ buttons for easy mobile tapping
- **Responsive Table**: Horizontal scrolling on small screens
- **Touch-Friendly**: Optimized button sizes and spacing

### Recommended Mobile Use
- Use in portrait mode for best experience
- Table scrolls horizontally if needed
- All buttons are thumb-friendly
- Game log is scrollable

## Differences from Soccer Tracker

This basketball tracker is based on the soccer tracker (`index.html`) but includes:

1. **Different Stats**: Basketball-specific (PTS, REB, AST, STL, TO) vs soccer (Goals, Shots, Passes, Blocks, Hustle)
2. **Points System**: Multi-point scoring with 1/2/3 point buttons
3. **Periods**: Basketball quarters (Q1-Q4, OT) instead of continuous time
4. **Theme**: K-State Wildcats purple instead of Jr Current teal/navy
5. **Scoreboard**: Automatic score calculation from points
6. **Complete Roster Reports**: All players included in email summaries

## Known Limitations

- No server-side storage (localStorage only)
- Data doesn't sync across devices
- Email export requires email client on device
- No game history or multi-game tracking
- No PDF export (email text only)

## Future Enhancement Ideas

- [ ] Save multiple games with game history
- [ ] Export to PDF or CSV
- [ ] Shooting percentage tracking
- [ ] Plus/minus calculations
- [ ] Substitution tracking
- [ ] Shot chart visualization
- [ ] Season statistics aggregation
- [ ] Cloud sync across devices

## Support & Maintenance

### Clearing Data
To reset and start fresh:
```javascript
// In browser console:
localStorage.removeItem('hoops-game-state');
localStorage.removeItem('hoops-opponent-roster');
```
Then refresh the page.

### Troubleshooting

**Stats not saving?**
- Check if browser localStorage is enabled
- Check browser privacy settings
- Try a different browser

**Email not working?**
- Ensure device has an email client configured
- Some mobile browsers may require specific email apps
- Copy summary manually if needed

**Timer not updating?**
- Ensure page stays active (not in background)
- Check browser tab isn't throttled

## Credits

**Created with**: Claude Code (Anthropic)
**Inspired by**: Kansas State Athletics (kstatesports.com)
**Based on**: Jr Current Soccer Stat Tracker
**Date Created**: November 2025

## License

This is a custom tool created for personal/team use. Modify and use as needed for your basketball team!

---

**Go Wildcats! 🐾**
