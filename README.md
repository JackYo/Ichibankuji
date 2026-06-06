# 一番賞 (Ichibankuji) - Lottery Simulation Web App

A web-based lottery drawing simulator inspired by Japanese 一番賞 (Ichibankuji/First Prize) lottery boxes. Run draws, track history, and manage prizes entirely in your browser.

## Features

✨ **Interactive Prize Drawing**
- Weighted random drawing system proportional to remaining quantities
- Real-time quantity tracking
- Visual feedback with congratulations modal

📋 **Draw History**
- Persistent history of all draws in current round
- Timestamps for each draw
- Remaining quantity tracking

⚙️ **Admin Configuration Panel**
- Hidden admin interface for prize management
- Add, edit, or delete prizes
- Configure quantities for each prize
- Password-protected access

🔄 **Round Management**
- "New Round" button to reset and start fresh
- Confirmation dialog to prevent accidental data loss
- Seamlessly load new configurations

💾 **Persistent Storage**
- All data stored in browser localStorage
- Survives page reloads and browser close/reopen
- No backend or internet connection required

📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for small screens

## Usage

### Playing the Lottery

1. **Access the Game**: Visit the deployed site at `/Ichibankuji/`
2. **View Prizes**: See all available prizes with remaining quantities
3. **Draw**: Click "Draw Prize" button to select a random prize
4. **View Result**: See the drawn prize in the modal
5. **Check History**: Scroll down to see all draws in current round
6. **Start New Round**: Click "New Round" to reset quantities and history

### Admin Configuration

1. **Access Admin**: Click the title "一番賞 Lottery" to navigate to admin panel
2. **Enter Password**: Type `admin123` (default admin password)
3. **Configure Prizes**:
   - Edit prize names and quantities
   - Click "+ Add Prize" to add new prizes
   - Click "Delete" to remove prizes
4. **Apply Changes**: Click "Apply Changes" to save configuration
5. **Start New Round**: New configuration applies when next round starts
6. **Logout**: Click "Logout" button to exit admin mode

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

Edit `src/utils/storage.js` to change the default prizes:

```javascript
const DEFAULT_CONFIG = {
  prizes: [
    { name: 'Your Prize', initialQuantity: 1 },
    // ...add more prizes
  ],
  timestamp: Date.now(),
};
```

## Architecture

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Persistence**: Browser localStorage
- **Authentication**: Frontend password (hidden route)
- **Storage Limit**: ~5MB per domain (localStorage quota)

## Data Model

### localStorage Keys

- `ichibankuji_config`: Prize configuration
- `ichibankuji_gameState`: Current game state (quantities, draw history)

### Prize Configuration Schema

```json
{
  "prizes": [
    { "name": "Prize Name", "initialQuantity": 5 }
  ],
  "timestamp": 1234567890
}
```

### Game State Schema

```json
{
  "quantities": {
    "Prize Name": 4
  },
  "records": [
    {
      "timestamp": 1234567890,
      "prizeName": "Prize Name",
      "remainingQty": 4
    }
  ]
}
```

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest (iOS 12+)
- Requires localStorage support

## Troubleshooting

### Game data disappeared

- Check browser's localStorage isn't disabled
- Data is per-browser, not synced across devices
- Try clearing browser cache and reloading

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

These limitations are by design for a GitHub Pages static deployment.

## Development Notes

### Drawing Algorithm

Uses weighted random selection:
1. Build cumulative sum of remaining quantities
2. Generate random number between 0 and total
3. Find prize matching the random value
4. Ensure fairness: probability = remaining_qty / total_remaining

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
