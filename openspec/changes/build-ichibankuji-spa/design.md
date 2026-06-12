# Design: Ichibankuji Lottery Simulation (Realistic Kuji Experience)

## Context

GitHub Pages only supports static content, so the app is a pure client-side SPA with localStorage persistence and frontend-based admin authentication.

The first iteration is implemented and deployed: React 18 + Vite, React Router (`/game`, `/admin`), a weighted-random "Draw" button, free-form prize rows, and a quantity grid. This revision reworks the game experience to mirror a real ichiban kuji:

- A real kuji has a **fixed, sealed ticket pool**: the outcome of each physical ticket is decided when the box is filled, not at the moment of drawing. The player chooses *which* ticket to take.
- Stores track claimed prizes by **pasting stickers on a prize board**, one slot per ticket, grouped by grade (A賞, B賞, …).
- Prizes follow a standard **grade ladder A–F** rather than arbitrary names.

## Goals / Non-Goals

**Goals:**
- Faithful simulation of ticket drawing (pick a specific sealed ticket from the remaining pool) and sticker pasting (per-slot claim marks on a prize board)
- Six fixed prize grades A賞–F賞, each with admin-configurable content and quantity
- Single draw and 5-ticket multi-draw (5連抽), mirroring how real buyers purchase in batches
- Last One 賞 awarded with the final ticket, like a real campaign
- Dedicated `/admin` page to manage the grade tiers and the Last One prize
- Safe migration from the v1 localStorage schema
- Keep working on GitHub Pages with no backend

**Non-Goals:**
- Real-time multi-user synchronization or shared lottery state across browsers
- Server-side authentication or security
- Double-chance campaigns (W チャンス賞) — candidate future enhancement, out of scope here
- Prize images/photo upload (content is text-only for now)

## Decisions

### 1. React + Vite Framework (unchanged)
**Decision:** Use React 18 with Vite as build tool
**Rationale:** Industry standard, great ecosystem, fast HMR for development
**Alternatives Considered:** Vue (simpler but smaller ecosystem), vanilla JS (less maintainable)

### 2. Client-Side Routing (unchanged)
**Decision:** React Router v6 with /game and /admin routes
**Rationale:** Clean separation of concerns, easy to navigate
**Alternatives Considered:** Custom routing (more boilerplate), hash-based routing (uglier URLs)

### 3. localStorage for State (unchanged)
**Decision:** Use localStorage as single source of truth for all game state
**Rationale:** No backend available, survives page reloads, simple API
**Alternatives Considered:** IndexedDB (overkill), SessionStorage (lost on close)

### 4. Frontend Password Authentication (unchanged)
**Decision:** Hardcoded admin password in frontend, validated before showing admin panel
**Rationale:** Sufficient for trust-based access control, prevents accidental changes
**Risk Acceptance:** Password visible in client-side code; suitable for shared/known-user scenario

### 5. Pre-shuffled Persistent Ticket Pool (replaces "Weighted Random Draw")
**Decision:** At round start, expand the grade configuration into a flat array of tickets (`{ id, grade }`, one per unit of quantity), shuffle it once with Fisher–Yates, and persist the shuffled order in localStorage. Drawing = the player taps a specific face-down ticket; its grade was already fixed at shuffle time.
**Rationale:** This is how a real kuji box works — outcomes are sealed when the box is filled. It also makes the draw UI honest: the player genuinely chooses a ticket rather than triggering an RNG dressed up as a choice. Statistically equivalent to weighted random over remaining quantities, but the mechanic (and the player's sense of agency) matches reality.
**Alternatives Considered:** Per-draw weighted RNG with a fake ticket-pick UI (dishonest, and a reload could change "the same ticket's" outcome); dealing tickets lazily (complicates persistence with no benefit).

### 6. Fixed Grade Ladder A–F
**Decision:** The six grades A–F are a fixed enum; admin edits each grade's prize content (name/description) and quantity (0 allowed, meaning the grade is unused; total tickets must be ≥ 1).
**Rationale:** Matches real ichiban kuji conventions, simplifies the admin UI (no add/delete row management), and gives the sticker board a stable layout.
**Alternatives Considered:** Free-form tiers with a grade label field (more flexible but loses the standard look and invites inconsistent data); supporting G+ grades (rare in practice, can extend the enum later).

### 7. Sticker Board Derived from Draw State
**Decision:** The sticker board renders one slot per ticket grouped by grade, computed from config + drawn-ticket records. No separate sticker state is stored; a slot shows a sticker when its grade's drawn-count covers it. Sticker pasting animates via CSS transition when a new draw lands.
**Rationale:** Derived state cannot drift from the ticket pool; localStorage stays small.
**Alternatives Considered:** Storing per-slot sticker state explicitly (redundant, risks inconsistency).

### 8. Schema v2 with Versioned Migration
**Decision:** Add `version: 2` to both `ichibankuji_config` and `ichibankuji_gameState`. Config: `{ version, grades: [{ grade: 'A'..'F', name, quantity }], lastOne: { name }, timestamp }`. Game state: `{ version, tickets: [{ id, grade, drawn, drawnAt }], records: [...] }` (the final ticket's record carries `lastOne: true`). On load, data without `version: 2` is replaced by the default A–F sample configuration and a fresh pool.
**Rationale:** v1 free-form prize names cannot be meaningfully mapped onto fixed grades, and the deployed app holds only sample data, so reinitialization is acceptable and far simpler than a mapping UI. Versioning makes future migrations cheap.
**Alternatives Considered:** Best-effort v1→v2 mapping by row order (fragile, wrong for >6 or <6 rows); silent crash on old data (unacceptable).

### 9. Reveal Animation via CSS
**Decision:** Ticket pick triggers a flip/peel reveal implemented with CSS transforms and transitions inside the result modal; sticker pasting uses a scale/fade-in transition. No animation library.
**Rationale:** Keeps the bundle dependency-free; CSS covers the needed effects.
**Alternatives Considered:** framer-motion (nicer spring physics but a new dependency for two effects).

### 10. Per-User State Isolation (unchanged)
**Decision:** Each browser gets isolated game state, no cross-user synchronization
**Rationale:** Simplifies architecture, suitable for independent players

### 11. Gold/Silver Sticker Tiers
**Decision:** One uniform sticker shape, color-coded by grade tier: gold for A賞–C賞, silver for D賞–F賞.
**Rationale:** Mirrors how stores visually distinguish upper prizes; color alone keeps the board readable without per-grade art assets.
**Alternatives Considered:** Per-grade sticker images (asset overhead), uniform single color (loses the upper/lower tier signal).

### 12. 5連抽 as Batched Picks, Atomic Commit
**Decision:** A mode toggle on the game page switches between 單抽 and 5連抽. In 5連抽 the player picks five distinct face-down tickets; nothing commits until the fifth pick, then all five are marked drawn, recorded, and persisted in one localStorage write, followed by a sequential five-reveal presentation. The mode is selectable only while ≥ 5 tickets remain.
**Rationale:** Batched picking matches buying five tickets at once at a store. Atomic commit avoids a half-completed multi-draw if the page dies mid-sequence; the pre-shuffled pool guarantees the outcomes were fixed before picking either way.
**Alternatives Considered:** Five independent sequential single draws (reload mid-way leaves a confusing partial batch in history), auto-picking five random tickets (removes the player's agency, which is the point of the rework), allowing 5連抽 with < 5 remaining by drawing the remainder (ambiguous expectations; single draws cover the tail cleanly).

### 13. Last One 賞 on the Final Ticket
**Decision:** The draw that takes the pool's final ticket additionally awards the Last One prize, configured in `/admin` (name field, always enabled). The final draw's record carries a `lastOne: true` flag; the sticker board shows a dedicated Last One row whose claimed state is derived from pool emptiness. The reveal sequence plays the ticket's own grade first, then a celebration reveal for the Last One prize (including when the final ticket is consumed inside a 5連抽).
**Rationale:** This is the signature mechanic of real ichiban kuji and gives the end of a round a climax. Deriving claimed-state from the pool keeps schema additions minimal.
**Alternatives Considered:** Optional enable/disable toggle (real campaigns always have it; a toggle adds admin complexity for no requested need), storing claimed state separately (redundant with pool emptiness).

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **BREAKING** schema change wipes v1 data | Existing browsers lose current round/history | Acceptable: deployed data is sample-only; migration message shown once on first v2 load |
| Password in frontend visible | Admin password could be discovered | Suitable only for trusted users; accept and document |
| Pre-shuffled pool stored client-side | A tech-savvy player could inspect localStorage and see undrawn ticket grades | Same trust model as frontend password; this is a simulation toy, accept and document |
| Large ticket pools (e.g., 80 tickets) crowd small screens | Ticket pool and sticker board UX degrades on mobile | Responsive grid with scroll; cap total tickets at a sane limit (e.g., 200) in admin validation |
| No cross-user sync | Multiple users can't share a single kuji box | Per-user isolation acceptable; out of scope |
| localStorage limit ~5MB | History could theoretically exceed limit | Not a concern for typical usage |

## Migration Plan

1. Implement schema v2 in `storage.js` with version check + reinitialization of unversioned data
2. Build TicketPool and StickerBoard components behind the existing `/game` route
3. Rework `/admin` PrizeEditor into the fixed A–F grade editor
4. Rework reset flow to regenerate + reshuffle the pool
5. Manual test all flows (fresh browser, v1-data browser, mid-round reload)
6. Build and deploy to GitHub Pages

Rollback: redeploy previous build; v2 data in users' localStorage is ignored by v1 code only if guarded — since v1 has no version guard, a rollback also requires users to clear site data (documented, low stakes).

## Open Questions

None — earlier questions resolved by the user: gold stickers for A–C / silver for D–F (Decision 11), 5連抽 supported (Decision 12), Last One 賞 included (Decision 13).
