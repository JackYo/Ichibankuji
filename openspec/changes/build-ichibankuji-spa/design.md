# Design: Ichibankuji Lottery Simulation

## Context

GitHub Pages only supports static content. Traditional backend-based lottery systems aren't possible. Solution: Pure client-side SPA with localStorage persistence and frontend-based admin authentication.

## Goals

- Deploy working lottery simulation on GitHub Pages
- Admin can configure prizes without touching code
- Per-browser game state isolation
- Safe round management with confirmation dialogs

## Non-Goals

- Real-time multi-user synchronization
- Server-side authentication or security
- Cross-browser state sharing
- Database persistence

## Technical Decisions

### 1. React + Vite Framework
**Decision:** Use React 18 with Vite as build tool  
**Rationale:** Industry standard, great ecosystem, fast HMR for development  
**Alternatives Considered:** Vue (simpler but smaller ecosystem), vanilla JS (less maintainable)

### 2. Client-Side Routing
**Decision:** React Router v6 with /game and /admin routes  
**Rationale:** Clean separation of concerns, easy to navigate  
**Alternatives Considered:** Custom routing (more boilerplate), hash-based routing (uglier URLs)

### 3. localStorage for State
**Decision:** Use localStorage as single source of truth for all game state  
**Rationale:** No backend available, survives page reloads, simple API  
**Alternatives Considered:** IndexedDB (overkill), SessionStorage (lost on close), IndexedDB (too complex for this use case)

### 4. Frontend Password Authentication
**Decision:** Hardcoded admin password in frontend, validated before showing admin panel  
**Rationale:** Sufficient for trust-based access control, prevents accidental changes  
**Risk Acceptance:** Password visible in client-side code; suitable for shared/known-user scenario  
**Alternatives Considered:** Server-side auth (not available), OAuth (unnecessary complexity)

### 5. Per-User State Isolation
**Decision:** Each browser gets isolated game state, no cross-user synchronization  
**Rationale:** Simplifies architecture, suitable for independent players  
**Alternatives Considered:** Shared server state (not available), IndexedDB sync (too complex)

### 6. Weighted Random Draw
**Decision:** Prize selection proportional to remaining quantities  
**Rationale:** Mimics real lottery mechanics, prevents empty selections  
**Implementation:** Accumulator algorithm with weighted ranges

## Risks & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Password in frontend visible | Admin password could be discovered | Suitable only for trusted users; accept and document |
| No cross-user sync | Multiple users can't share single lottery state | Per-user isolation acceptable; state sharing out of scope |
| localStorage limit ~5MB | Game history could theoretically exceed limit | Not a concern for typical usage |
| No persistence between browsers | User state lost when switching browsers | Expected behavior; document in README |

## Migration Plan

1. Deploy empty GitHub Pages site with scaffolding
2. Implement game mechanics and state persistence
3. Add admin panel for configuration
4. Test all flows thoroughly
5. Write deployment documentation

## Open Questions

1. What should the default prize configuration be? Hardcoded sample or blank start?
2. Should admin password be per-session (in-memory flag) or persistent?
3. CSS framework choice: Tailwind, Bootstrap, or custom CSS?
4. How many draws should history display retain? Unlimited or paginated?
5. Should draw results show visual animation or just show result?
