# Wildcats Basketball Website

A professional website for the Wildcats 4th grade basketball team featuring a home page, live schedule with game results, team roster with player photos, and detailed match reports.

## 🏀 Quick Links

- **Website URL**: `file:///Users/paulsnider/jrkccurrent/wildcats-basketball/index.html`
- **Live Site**: Open `index.html` in any web browser
- **Schedule Page**: Most frequently updated page for game scores and match reports

## 📁 File Structure

```
wildcats-basketball/
├── index.html                          # Home page
├── README.md                           # This file
├── img/
│   ├── logo.png                       # Team logo (used in nav & favicon)
│   └── team.jpg                       # Team photo
├── schedule/
│   ├── index.html                     # Schedule page with game results
│   ├── README.md                      # Detailed schedule documentation
│   ├── game-summary-YYYY-MM-DD.txt   # Game stats (reference)
│   └── match-report-YYYY-MM-DD.txt   # Match reports (reference)
└── roster/
    ├── index.html                     # Roster page
    └── [player-name].png             # Player photos
```

## 🎯 Most Common Task: Adding Game Results

### Step 1: Open the Schedule Page

Open `/wildcats-basketball/schedule/index.html` in a text editor (like VS Code, Sublime Text, or Notepad++).

### Step 2: Find the `gameResults` Object

Search for `gameResults` (around line 630). You'll see something like this:

```javascript
const gameResults = {
    '2025-11-15': {
        score: 'Wildcats 10 - 10 All Stars (OT)',
        matchReport: `Match Report: Wildcats vs All Stars
Date: November 15, 2025
Final Score: 10-10 (Tie after OT)

The game narrative...
`
    }
};
```

### Step 3: Add Your New Game

Add a comma after the last game entry and add your new game:

```javascript
const gameResults = {
    '2025-11-15': {
        score: 'Wildcats 10 - 10 All Stars (OT)',
        matchReport: `...existing report...`
    },
    '2025-11-22': {  // NEW GAME - Use YYYY-MM-DD format
        score: 'Wildcats 15 - 12 Spruill',
        matchReport: `Match Report: Wildcats vs Spruill
Date: November 22, 2025
Final Score: 15-12

The Wildcats secured their first win of the season...

### First Half – Strong Start

Opening narrative here...

### Second Half – Sealed the Victory

Second half narrative...

### Wildcats Highlights

* **#25 Emersyn**
  8 points, 3 rebounds. Led the team in scoring with clutch baskets.

* **#2 Felicity**
  4 points, 5 rebounds. Dominated the boards on both ends.

Closing paragraph here.
`
    }
};
```

### Step 4: Save and Test

1. Save the file
2. Open `schedule/index.html` in your browser
3. Click on the game date to verify the score appears
4. Click "View Match Report" to verify the report displays correctly

## 📝 Score Format Guidelines

**IMPORTANT**: The score format determines if it's a win, loss, or tie.

### Wins
```javascript
score: 'Wildcats 15 - 12 Opponent'  // Wildcats score HIGHER
```

### Losses
```javascript
score: 'Wildcats 12 - 15 Opponent'  // Wildcats score LOWER
```

### Ties
```javascript
score: 'Wildcats 10 - 10 Opponent'  // Equal scores
```

### Overtime Games
Add `(OT)` at the end:
```javascript
score: 'Wildcats 10 - 10 All Stars (OT)'
```

The season record (W-L-T) updates automatically based on these scores!

## ✍️ Match Report Writing Guide

### Match Report Template

```
Match Report: Wildcats vs [Opponent]
Date: [Month Day, Year]
Final Score: [Score]

[Opening paragraph - game overview and final result]

### First Half – [Descriptive Title]

[First half narrative with player actions and key moments]

### Second Half – [Descriptive Title]

[Second half narrative with plays and momentum changes]

### Overtime – [Descriptive Title] (if applicable)

[Overtime description]

### Wildcats Highlights

* **#[Number] [Player Name]**
  [Stats] [Performance description]

* **#[Number] [Player Name]**
  [Stats] [Performance description]

[Closing paragraph wrapping up the game story]
```

### Formatting Rules

- **Bold text**: Use `**text**` for player names and jersey numbers
- **Section headings**: Start with `###` followed by a space
- **Player highlights**: Start each line with `* ` (asterisk and space)
- **Line breaks**: Use actual blank lines between paragraphs
- **No special characters**: Avoid using backticks (`) in your text
- **Apostrophes**: Use straight apostrophes ('), not curly quotes

### Example Player Highlight

```
* **#5 Blake**
  6 points, 2 steals, 1 rebound. Her defense was relentless and she hit two big shots in the fourth quarter to seal the win.
```

## 🏠 Website Pages Overview

### Home Page (`index.html`)
- Team photo display
- Quick links to Schedule and Roster
- Season statistics overview
- Navigation to all sections

**To Update:**
- Team photo: Replace `img/team.jpg` with new photo
- Season stats: Edit the "Stats Section" in `index.html` (around line 390)

### Schedule Page (`schedule/index.html`)
- Automatically loads from TeamSnap calendar
- Displays upcoming games and practices
- Shows game results with scores
- Match reports in beautiful modal overlays

**Calendar Source:**
- URL: `http://ical-cdn.teamsnap.com/team_schedule/...`
- Updates automatically when page refreshes
- Located at line 435 in `schedule/index.html`

**Filter Options:**
- **All**: Shows every event (games and practices)
- **Upcoming** (default): Last completed game + future events
- **Results**: All past games in reverse order

### Roster Page (`roster/index.html`)
- Displays all 10 players with photos
- Shows jersey numbers
- Team statistics overview

**To Update:**
- Player photos: Replace images in `/roster/` folder
- Photo alignment: See "Player Photo Alignment" section below

## 🖼️ Managing Images

### Logo (`img/logo.png`)
- Used in navigation bar on all pages
- Used as favicon (browser tab icon)
- Displayed with white circular background
- **To replace**: Overwrite `img/logo.png` with new logo

### Team Photo (`img/team.jpg`)
- Displayed on home page
- **To replace**: Overwrite `img/team.jpg` with new photo

### Player Photos (`roster/[name].png`)
- Format: PNG images
- Naming: Lowercase first name (e.g., `madison.png`, `winnie.png`)
- Recommended size: 500px width minimum
- **To replace**: Overwrite existing player photo

### Player Photo Alignment

If a player's face is cut off or poorly positioned:

1. Open `roster/index.html`
2. Find the player's image tag (search for their name)
3. Add an alignment class:

```html
<!-- Default (shows face area) -->
<img src="madison.png" alt="Madison #00" class="player-photo">

<!-- More centered on face -->
<img src="madison.png" alt="Madison #00" class="player-photo align-middle">

<!-- Show more from top -->
<img src="madison.png" alt="Madison #00" class="player-photo align-top">
```

**Available alignment classes:**
- `align-top` - Shows more from the top (20%)
- Default - Centered on upper body (30%)
- `align-center` - Slightly below default (40%)
- `align-middle` - True center (50%)

## 🎨 Branding & Colors

### K-State Wildcats Colors
```css
--kstate-purple: #512888    /* Primary purple */
--kstate-dark-purple: #3d1f66   /* Darker shade */
--gold: #ffc627             /* Gold accent */
--kstate-silver: #c0c0c0    /* Silver accent */
```

### Where Colors Are Used
- **Navigation bar**: Purple gradient
- **Buttons**: Gold for primary actions
- **Headers**: Purple text
- **Links**: Purple with gold hover
- **Player jerseys**: Purple background, gold numbers

## 📱 Mobile Responsive

All pages are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones

The navigation automatically converts to a hamburger menu (☰) on smaller screens.

## 🔧 Technical Details

### Schedule Calendar Integration
- Automatically syncs with TeamSnap ICS calendar
- Uses CORS proxy for browser compatibility
- Falls back through 3 different proxies if one fails
- Parses dates, times, locations, and descriptions

### Match Report Modal
- Opens in overlay (no navigation away from page)
- Automatically formats Markdown-style text
- Converts `###` to headings
- Converts `**text**` to bold
- Converts `* list` to formatted bullet points
- Scrollable for long reports
- Close with: X button, clicking outside, or Escape key

### Season Record Calculation
The W-L-T record is calculated automatically from scores in `gameResults`:
- Compares Wildcats score vs opponent score
- Updates header display in real-time
- Format: `W-L-T` (e.g., "3-2-1" = 3 wins, 2 losses, 1 tie)

## 🐛 Troubleshooting

### Schedule Not Loading
1. Check browser console for errors (F12 → Console)
2. Verify TeamSnap calendar URL is still valid
3. Try refreshing the page (Cmd/Ctrl + R)

### Match Report Not Displaying
1. Verify date format is exactly `YYYY-MM-DD` (e.g., `2025-11-22`)
2. Check for syntax errors in JavaScript:
   - Missing commas between game entries
   - Unclosed backticks (`)
   - Unclosed quotes
3. Open browser console (F12) to see error messages

### Player Photo Not Showing
1. Verify image file exists in `/roster/` folder
2. Check filename matches exactly (case-sensitive)
3. Ensure image is PNG format
4. Check browser console for 404 errors

### Logo Not Visible
- Logo should have white circular background
- If not visible, check CSS includes: `background: var(--white);`

## 📞 Support & Maintenance

### Common Maintenance Tasks
1. **Weekly**: Add new game results after each game
2. **Monthly**: Update team photo if new one available
3. **As needed**: Update player photos
4. **End of season**: Archive old game data

### File Backup
Recommended to backup these files regularly:
- `/schedule/index.html` (contains all game results)
- `/img/` folder (team and logo images)
- `/roster/` folder (player photos)

### Browser Compatibility
Tested and working on:
- Google Chrome
- Safari
- Firefox
- Microsoft Edge

## 📚 Additional Documentation

For more detailed information about the schedule page specifically, see:
- `/schedule/README.md` - In-depth schedule page documentation

## 🎓 Quick Reference

### Adding a Game Result (Quick Steps)
1. Open `schedule/index.html`
2. Find `gameResults` (line ~630)
3. Add new game with date, score, and match report
4. Save file
5. Test in browser

### Match Report Checklist
- ✅ Date in YYYY-MM-DD format
- ✅ Score follows format: `Wildcats X - Y Opponent`
- ✅ Opening paragraph sets the scene
- ✅ Section headings use `###`
- ✅ Player highlights use `* **#Number Name**`
- ✅ Closing paragraph wraps up the story

---

**Wildcats Basketball** | 2024-2025 Season | Go Wildcats! 🏀
