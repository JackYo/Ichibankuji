# 一番賞 (Ichiban Kuji) - Lottery Simulation Web App

A web-based simulator of Japanese 一番賞 (Ichiban Kuji) lottery boxes that recreates the real in-store experience: pick a sealed ticket from the box, reveal your prize grade, and watch the sticker get pasted on the prize board. Runs entirely in your browser.

## Features

🎫 **Realistic Ticket Drawing (抽籤)**
- A pre-shuffled pool of sealed tickets — outcomes are fixed when the box is filled, just like a real kuji box
- You pick a specific ticket, not a "draw" button
- Flip-reveal animation showing the grade and prize
- 單抽 (single draw) or 5連抽 (pick five tickets, revealed in sequence)

🏆 **Prize Grades A賞–F賞**
- Six fixed grades, each with configurable prize content and quantity
- Gold treatment for upper grades (A–C), silver for lower grades (D–F)

✨ **Last One 賞**
- Whoever draws the final ticket also wins the Last One prize, with a celebration reveal
- Configurable in the admin panel

📋 **Sticker Board (賞品一覽)**
- Store-style prize board with one slot per ticket
- Gold/silver stickers pasted with an animation as prizes are claimed
- Per-grade remaining counts and 完売 (sold out) indicators

📜 **Draw History**
- Every draw recorded with ticket number, grade, prize, and time
- Last One winner marked

⚙️ **Admin Panel (`/admin`)**
- Password-protected grade manager: edit each grade's prize content and quantity plus the Last One prize
- Live total ticket count, validation, max 200 tickets
- Changes apply when the next round starts

🔄 **Round Management**
- "New Round" rebuilds and reshuffles the ticket pool, clears stickers and history
- Confirmation dialog prevents accidental loss

💾 **Persistent Storage**
- All state in browser localStorage — survives reloads, works offline
- Mid-round reloads keep the same hidden ticket outcomes

## Usage

### Playing

1. **Access the Game**: Visit the deployed site at `/Ichibankuji/`
2. **Check the Board**: The prize board (賞品一覽) shows every grade, its prize, and what's left
3. **Pick a Ticket**: Tap any sealed ticket in the pool — or switch to 5連抽 and pick five (the draw commits when the fifth is picked)
4. **Reveal**: Watch the flip reveal; drawing the final ticket also wins the Last One 賞
5. **Watch the Board**: A gold (A–C) or silver (D–F) sticker is pasted for each claimed prize
6. **New Round**: Click "New Round" to reshuffle a fresh pool

### Admin Configuration

1. **Access Admin**: Click the page title (or browse to `/admin`)
2. **Enter Password**: Type `admin123` (default admin password)
3. **Configure Grades**: Edit each grade's (A賞–F賞) prize content and quantity — quantity 0 hides a grade
4. **Configure Last One 賞**: Set the Last One prize content
5. **Apply Changes**: Click "Apply Changes" — the configuration takes effect when the next round starts
6. **Logout**: Click "Logout" to exit admin mode

## Installation & Development

### Prerequisites
- Node.js 18+ (download from https://nodejs.org/)
- npm (comes with Node.js)

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/Ichibankuji.git
cd Ichibankuji

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start at: `http://localhost:5173/Ichibankuji/`

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub**: Push your code to GitHub repository
2. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source: Deploy from a branch
   - Set Branch: main (or master) / root folder
3. **GitHub Actions**: The `.github/workflows/deploy.yml` workflow will automatically build and deploy on every push

Your site will be available at: `https://your-username.github.io/Ichibankuji/`

### Manual Deployment

1. Run `npm run build` to create `dist/` folder
2. Copy contents of `dist/` folder to your static hosting
3. Ensure the app is served from `/Ichibankuji/` path

## Configuration

### Changing Admin Password

1. Open `src/pages/Admin.jsx`
2. Find line: `const ADMIN_PASSWORD = 'admin123'`
3. Change `'admin123'` to your desired password
4. Rebuild and redeploy

### Default Prize Configuration

Edit `DEFAULT_CONFIG` in `src/utils/storage.js` to change the default grades and Last One prize shown to first-time visitors.

## Architecture

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Persistence**: Browser localStorage (schema v2)
- **Authentication**: Frontend password (hidden route)
- **Storage Limit**: ~5MB per domain (localStorage quota)

## Data Model

### localStorage Keys

- `ichibankuji_config`: Prize configuration (grades + Last One)
- `ichibankuji_gameState`: Current round state (ticket pool, draw history)

### Prize Configuration Schema (v2)

```json
{
  "version": 2,
  "grades": [
    { "grade": "A", "name": "豪華模型 Premium Figure", "quantity": 1 }
  ],
  "lastOne": { "name": "特別色模型 Last One Special Figure" },
  "timestamp": 1234567890
}
```

### Game State Schema (v2)

```json
{
  "version": 2,
  "tickets": [
    { "id": "T001", "grade": "C", "drawn": false, "drawnAt": null }
  ],
  "records": [
    {
      "timestamp": 1234567890,
      "ticketId": "T001",
      "grade": "C",
      "prizeName": "插畫色紙 Art Board",
      "lastOne": true
    }
  ]
}
```

The `tickets` array order is the shuffled pool order, fixed at round start. Data from the previous (v1) schema is automatically reset to the new format with a one-time notice.

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest (iOS 12+)
- Requires localStorage support

## Troubleshooting

### Game data disappeared

- Check browser's localStorage isn't disabled
- Data is per-browser, not synced across devices
- Data saved before the A賞–F賞 update is reset once on first load (a notice is shown)

### Admin password wrong

- Default password is `admin123`
- Password is case-sensitive
- Check for extra spaces when typing

### Mobile display issues

- Try zooming out in browser
- Test in different browser
- Responsive design covers most devices

## Known Limitations

- ❌ No cross-browser or cross-device synchronization
- ❌ No real multi-user support (each user/browser independent)
- ❌ localStorage ~5MB limit (sufficient for typical use)
- ❌ Password visible in source code (frontend-only authentication)
- ❌ Ticket outcomes are stored client-side — a curious player could inspect localStorage (it's a simulation toy, not a gambling product)

These limitations are by design for a GitHub Pages static deployment.

## Development Notes

### Drawing Mechanics

Mirrors a real kuji box instead of rolling RNG per draw:
1. At round start, the grade configuration is expanded into one ticket per unit of quantity
2. The pool is shuffled once (Fisher–Yates) and persisted — every ticket's outcome is sealed from then on
3. The player draws by picking a specific ticket; reloading mid-round never changes a ticket's hidden grade
4. A 5連抽 batch commits atomically on the fifth pick — abandoning mid-pick consumes nothing
5. The draw that empties the pool additionally wins the Last One 賞

### State Management

- Game state managed via React hooks
- Synchronized with localStorage after each action
- Refresh loads latest state from localStorage
- No external backend or server communication

### Security Notes

- ⚠️ Password visible in client code (for hidden URL access only)
- ⚠️ Configuration changeable by any user with admin access
- ⚠️ No audit logging or multi-user validation
- Suitable for trusted, known users only

## License

MIT - Feel free to use, modify, and distribute

## Contributing

Pull requests welcome! Please feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Add translations

---

Built with ❤️ using React + Vite
