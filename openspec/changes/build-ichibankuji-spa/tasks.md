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
