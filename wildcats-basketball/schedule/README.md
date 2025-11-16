# Wildcats Basketball Schedule

A professional, interactive schedule page for the Wildcats 4th grade basketball team. Features automatic calendar synchronization, game results, and detailed match reports.

## Features

- **Live Schedule Updates**: Automatically syncs with TeamSnap ICS calendar
- **Professional Design**: K-State Wildcats purple and gold color scheme
- **Smart Filtering**: View all games, upcoming games, or past results
- **Game Results**: Display final scores with automatic W-L-T record calculation
- **Match Reports**: Beautiful modal overlays for detailed game narratives
- **Responsive Layout**: Works on desktop, tablet, and mobile devices

## File Structure

```
wildcats-basketball/schedule/
├── index.html                          # Main schedule page
├── README.md                           # This file
├── game-summary-2025-11-15.txt        # Game stats (reference)
└── match-report-2025-11-15.txt        # Match report narrative (reference)
```

## How to Add Game Results

Game results are stored in the `gameResults` object in `index.html`. To add a new game result:

1. Open `index.html` in a text editor
2. Find the `gameResults` object (around line 630)
3. Add a new entry using the game date as the key in YYYY-MM-DD format:

```javascript
const gameResults = {
    '2025-11-15': {
        score: 'Wildcats 10 - 10 All Stars (OT)',
        matchReport: `Match Report: Wildcats vs All Stars
Date: November 15, 2025
Final Score: 10-10 (Tie after OT)

The game narrative goes here...

### First Half – Section Title

Paragraph text here...

### Wildcats Highlights

* **#25 Player Name**
  Stats and description here.
`
    },
    '2025-11-22': {  // Add new game here
        score: 'Wildcats 15 - 12 Spruill',
        matchReport: `Match Report: Wildcats vs Spruill
Date: November 22, 2025
Final Score: 15-12

Your match report content here...
`
    }
};
```

### Score Format

The score should follow this format:
- **Win**: `'Wildcats 15 - 12 Opponent'`
- **Loss**: `'Wildcats 12 - 15 Opponent'`
- **Tie**: `'Wildcats 10 - 10 Opponent (OT)'`
- **Include OT**: Add `(OT)` if the game went to overtime

The system automatically calculates the W-L-T record from all scores.

## How to Write Match Reports

Match reports use Markdown-style formatting within JavaScript template literals. Here's the recommended structure:

### Match Report Template

```
Match Report: Wildcats vs [Opponent]
Date: [Month Day, Year]
Final Score: [Score]

[Opening paragraph describing the game]

### First Half – [Section Title]

[Narrative about first half]

[Player actions and key moments]

### Second Half – [Section Title]

[Narrative about second half]

[Key plays and momentum shifts]

### Overtime – [Section Title] (if applicable)

[OT description]

### Wildcats Highlights

* **#[Number] [Player Name]**
  [Stats and performance description]

* **#[Number] [Player Name]**
  [Stats and performance description]

[Closing paragraph]
```

### Formatting Guidelines

- **Bold text**: Use `**text**` for player names and numbers
- **Headings**: Use `###` for section titles (First Half, Second Half, etc.)
- **Bullet lists**: Start lines with `* ` for player highlights
- **Line breaks**: Use actual line breaks between paragraphs
- **No HTML needed**: The system converts Markdown to formatted HTML automatically

### Example Player Highlight

```
* **#25 Emersyn**
  Leading scorer with 6 points, plus 2 rebounds and 2 steals. She scored at the end of the first half, again to spark the second half comeback, and then drilled the late game tying basket.
```

## Game Stats Files (Reference Only)

The `.txt` files in this folder are for reference and documentation:

- **`game-summary-YYYY-MM-DD.txt`**: Structured game statistics (points, rebounds, assists, steals, turnovers)
- **`match-report-YYYY-MM-DD.txt`**: Full narrative match report

These files are NOT loaded by the website - they're kept for record-keeping. The actual content displayed on the website comes from the `gameResults` object in `index.html`.

## Season Record

The season record in the header is calculated automatically based on the scores in `gameResults`. It follows this logic:

- **Win**: Wildcats score > Opponent score
- **Loss**: Wildcats score < Opponent score
- **Tie**: Wildcats score = Opponent score

The record displays as:
- With ties: `Record: 3-1-1` (3 wins, 1 loss, 1 tie)
- Without ties: `Record: 3-1` (3 wins, 1 loss)

## Calendar Synchronization

The schedule automatically loads from TeamSnap ICS calendar:
- URL: `http://ical-cdn.teamsnap.com/team_schedule/c85af52b-3eb0-424d-aad6-05c2659447bd.ics`
- Updates automatically when you refresh the page
- Uses CORS proxy for browser compatibility
- Falls back through multiple proxies if one fails

## Filter Views

The page offers three filter options:

1. **All**: Shows every game and practice on the schedule
2. **Upcoming** (default): Shows last completed game + all future events
3. **Results**: Shows all past games in reverse chronological order

## Customization

### Colors

K-State Wildcats color variables are defined at the top of the CSS (around line 10):

```css
:root {
    --kstate-purple: #512888;
    --kstate-dark-purple: #3d1f66;
    --kstate-silver: #c0c0c0;
    --gold: #ffc627;
}
```

### Team Name

To change the team name, update line 577:
```html
<h1>Wildcats Basketball</h1>
```

### Season Year

To change the season year, update line 578:
```html
<p>2024-2025 Season</p>
```

## Troubleshooting

### Schedule not loading
- Check browser console for errors
- Verify TeamSnap calendar URL is still valid
- Try refreshing the page

### Match report not displaying
- Verify the date key matches the game date exactly (YYYY-MM-DD format)
- Check for syntax errors in the template literal (missing backticks)
- Ensure special characters are properly escaped

### Score not calculating correctly
- Verify score format: `'Wildcats [number] - [number] [Opponent]'`
- Make sure Wildcats appears first in the string
- Check that numbers are separated by space-dash-space (` - `)

## Support

For questions or issues with the schedule page, contact the team administrator.

---

**Wildcats Basketball** | 2024-2025 Season | Go Wildcats! 🏀
