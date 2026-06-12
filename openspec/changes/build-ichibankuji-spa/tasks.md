## 1. Project Setup

- [x] 1.1 Initialize React (or Vue) project with Vite
- [x] 1.2 Configure GitHub Pages deployment (github action or manual dist push)
- [x] 1.3 Set up project folder structure (src/, components/, pages/, utils/)
- [x] 1.4 Install dependencies (React Router for routing, any styling framework if chosen)

## 2. Data Model & Storage

- [x] 2.1 Define localStorage schema for prize configuration
- [x] 2.2 Define localStorage schema for game state (quantities, records)
- [x] 2.3 Create utility functions for reading/writing localStorage (getConfig, setState, getState)
- [x] 2.4 Create utility functions for resetting game state to initial configuration

## 3. Game Page - Core UI

- [x] 3.1 Create GamePage component layout (header, prize grid, draw button, history panel)
- [x] 3.2 Implement prize display component showing current quantities
- [x] 3.3 Implement draw button with visual feedback (disabled when all quantities are 0)
- [x] 3.4 Implement draw result modal/toast to display prize name and message

## 4. Game Page - Draw Mechanics

- [x] 4.1 Implement random draw algorithm (select prize proportional to remaining quantities)
- [x] 4.2 Implement quantity decrement on successful draw
- [x] 4.3 Implement draw record creation with timestamp
- [x] 4.4 Implement draw history display (table or list showing all draws in current round)
- [x] 4.5 Implement localStorage persistence for game state after each draw

## 5. Game Page - Reset Functionality

- [x] 5.1 Add "New Round" button to game page
- [x] 5.2 Implement confirmation dialog for "New Round" (warn user about data loss)
- [x] 5.3 Implement reset logic (clear quantities and draw records, load new configuration if available)
- [x] 5.4 Implement UI feedback after successful reset

## 6. Admin Panel - Access Control

- [x] 6.1 Create AdminPanel component with password input form
- [x] 6.2 Implement password validation (compare against hardcoded admin password)
- [x] 6.3 Implement session state for admin authentication (in-memory flag to remain logged in)
- [x] 6.4 Implement logout/back button to exit admin mode

## 7. Admin Panel - Configuration Management

- [x] 7.1 Create prize editor form (add, edit, delete prize rows)
- [x] 7.2 Implement prize name and quantity input fields with validation
- [x] 7.3 Implement "Apply Changes" button that saves new configuration to localStorage
- [x] 7.4 Display validation errors if configuration is invalid
- [x] 7.5 Implement confirmation message after successful configuration apply

## 8. Routing & Navigation

- [x] 8.1 Set up React Router with /game and /admin routes
- [x] 8.2 Create main App component with route definitions
- [x] 8.3 Configure GitHub Pages base URL in router (if needed for non-root deployment)
- [x] 8.4 Implement navigation from game page to admin (if discovered) or direct URL access
- [x] 8.5 Implement back/home navigation from admin to game page

## 9. Styling & UX Polish

- [x] 9.1 Style game page (prize grid, draw button, history display)
- [x] 9.2 Style admin panel (form layout, input fields, buttons)
- [x] 9.3 Style modals and dialogs (confirmation, result display, error messages)
- [x] 9.4 Ensure responsive design for mobile and desktop
- [x] 9.5 Add loading states and visual feedback for interactions

## 10. Testing & Validation

- [x] 10.1 Manual test: Load game page and verify prizes display correctly
- [x] 10.2 Manual test: Execute multiple draws and verify quantities decrement
- [x] 10.3 Manual test: Verify draw history persists across page reload
- [x] 10.4 Manual test: Access admin panel with correct password
- [x] 10.5 Manual test: Configure new prizes and apply changes
- [x] 10.6 Manual test: Verify new round button clears state and loads new configuration
- [x] 10.7 Manual test: Verify page works offline (localStorage-only state)

## 11. Deployment & Documentation

- [x] 11.1 Build production bundle: `npm run build`
- [x] 11.2 Deploy to GitHub Pages
- [x] 11.3 Test deployed site in different browsers
- [x] 11.4 Document admin password location and how to change it
- [x] 11.5 Create simple README with usage instructions

## 12. Schema v2 - Grades & Ticket Pool (storage.js)

- [x] 12.1 Define v2 config schema (`version: 2`, `grades` array with fixed A–F entries, `lastOne` prize) and new default sample configuration
- [x] 12.2 Define v2 game state schema (`version: 2`, shuffled `tickets` array, `records` with ticketId/grade/prizeName and `lastOne` flag on the final record)
- [x] 12.3 Implement ticket pool generation from grade config + Fisher–Yates shuffle
- [x] 12.4 Implement v1 detection and migration (reinitialize to v2 defaults, one-time user notice)
- [x] 12.5 Update storage utilities (draw ticket, derive remaining counts per grade, reset/reshuffle) and keep write-failure handling

## 13. Game Page - Ticket Pool Draw (抽籤)

- [x] 13.1 Create TicketPool component rendering all undrawn tickets face-down in a responsive grid
- [x] 13.2 Implement ticket selection (tap a specific ticket → mark drawn, persist immediately)
- [x] 13.3 Implement reveal animation (CSS flip/peel) showing grade letter and prize content in the result view
- [x] 13.4 Replace DrawButton flow with TicketPool on the game page; show sold-out state when pool is empty
- [x] 13.5 Update draw history panel to show grade + prize per record, with a Last One marker on the final draw
- [x] 13.6 Implement 單抽/5連抽 mode toggle (5連抽 only selectable while ≥ 5 tickets remain)
- [x] 13.7 Implement 5連抽 batch picking: select five tickets, atomic commit on the fifth pick, sequential five-result reveal; abandoning mid-pick consumes nothing
- [x] 13.8 Implement Last One 賞 celebration reveal when the final ticket is drawn (single draw or within a 5連抽 batch)

## 14. Game Page - Sticker Board (貼貼紙)

- [x] 14.1 Create StickerBoard component: one row per active grade (A賞–F賞), one slot per ticket, hide quantity-0 grades
- [x] 14.2 Derive stickered slots from draw records (no separate sticker state)
- [x] 14.3 Implement sticker paste animation when a new draw lands
- [x] 14.4 Color-code stickers by tier: gold for A賞–C賞, silver for D賞–F賞
- [x] 14.5 Show per-grade remaining/total counts and sold-out treatment for fully claimed grades
- [x] 14.6 Add Last One 賞 row (prize content, unclaimed/claimed states derived from pool emptiness)
- [x] 14.7 Replace PrizeGrid with StickerBoard in the game page layout

## 15. Admin Page - A–F Grade Manager

- [x] 15.1 Rework PrizeEditor into a fixed six-row A賞–F賞 editor (content + quantity per grade, no add/delete rows)
- [x] 15.2 Add Last One 賞 prize content field to the editor
- [x] 15.3 Implement validation (non-empty name when quantity > 0, integer quantities ≥ 0, total 1–200, non-empty Last One name) with per-field errors
- [x] 15.4 Display live total ticket count while editing
- [x] 15.5 Save applied configuration as schema v2 with confirmation noting next-round effect

## 16. Round Reset - Reshuffle

- [x] 16.1 Update reset logic to regenerate + reshuffle the pool from the latest applied configuration
- [x] 16.2 Update confirmation dialog copy to mention pool, stickers, and history reset
- [x] 16.3 Verify sticker board and history clear and counts restore after reset

## 17. Styling & UX Polish (v2)

- [x] 17.1 Style ticket pool (sealed-ticket look, hover/press feedback, responsive wrap/scroll for large pools)
- [x] 17.2 Style sticker board (store-board look, gold/silver sticker visuals, paste/sold-out treatments, Last One row)
- [x] 17.3 Style 5連抽 mode toggle, batch-pick selection state, and sequential reveal
- [x] 17.4 Style Last One celebration reveal
- [x] 17.5 Style admin grade editor rows, Last One field, and validation errors
- [x] 17.6 Verify mobile layout for an 80-ticket pool

## 18. Testing & Deployment (v2)

- [x] 18.1 Manual test: fresh browser seeds default A–F config and shuffled pool
- [x] 18.2 Manual test: ticket grades stable across mid-round reloads (same ticket → same result)
- [x] 18.3 Manual test: stickers and counts match draw history after reload
- [x] 18.4 Manual test: v1 localStorage data migrates to v2 defaults with notice, no crash
- [x] 18.5 Manual test: admin edits apply only after "New Round"; validation blocks bad configs (including empty Last One name)
- [x] 18.6 Manual test: 5連抽 picks five, commits atomically, reveals in order; abandoning mid-pick consumes nothing; mode disabled when < 5 remain
- [x] 18.7 Manual test: Last One 賞 awarded on the final ticket (single draw and inside a 5連抽); board row flips to claimed; reset restores it
- [ ] 18.8 Build, deploy to GitHub Pages, and verify on mobile + desktop
- [x] 18.9 Update README (A–F grades, ticket-pool mechanic, 5連抽, Last One 賞, admin guide)
