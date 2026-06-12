# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # setup
npm run dev          # dev server at http://localhost:5173/Ichibankuji/
npm run build        # vite build + copies dist/index.html → dist/404.html
npm run preview      # serve the production build locally
```

There is no test runner or linter configured. Verification in this repo has been done by driving the dev server with Playwright (`channel: 'msedge'` works on this machine without downloading browsers) and by importing `src/utils/storage.js` in Node with a mocked `globalThis.localStorage`.

## What this is

A 一番賞 (Ichiban Kuji) lottery simulator deployed to GitHub Pages — a pure client-side React 18 + Vite SPA with **no backend**; all state lives in browser localStorage. Pushing to `main` auto-deploys via `.github/workflows/deploy.yml` to `https://jackyo.github.io/Ichibankuji/`.

Constraints that follow from static hosting:
- React Router uses `basename="/Ichibankuji"` (set in `src/App.jsx`); Vite `base` matches.
- Deep links like `/admin` only work because the build copies `index.html` to `404.html` (GitHub Pages serves it for unknown paths, with a 404 status — that is expected). Don't remove that copy step from the `build` script.
- Admin auth is a hardcoded password in `src/pages/Admin.jsx` (`ADMIN_PASSWORD`), session held in component state only. This is intentional trust-based access, not security.

## Architecture

`src/utils/storage.js` is the single source of truth and the only module that touches localStorage (keys `ichibankuji_config`, `ichibankuji_gameState`, schema `version: 3`). Pages/components call its exported functions and re-read state after mutations; React state is just a render cache of localStorage.

Domain invariants encoded there — keep them intact:

- **Pre-shuffled ticket pool**: at round start the A賞–F賞 grade config expands into one ticket per unit, shuffled once (Fisher–Yates) and persisted. The `tickets` array order IS the pool; outcomes are sealed at round start (like a real kuji box), so a mid-round reload must never change a ticket's hidden grade. Only `resetGameState()` reshuffles.
- **Atomic draws**: `drawTickets(ids)` validates the whole batch, then marks tickets drawn + appends records + persists in a single write. The 5連抽 flow in `Game.jsx` accumulates five picks in React state and commits nothing until the fifth pick.
- **Last One 賞**: the draw that empties the pool gets `lastOne: true` on its record and the result carries `lastOnePrizeName`. This can happen mid-batch.
- **Derived sticker state**: `StickerBoard` computes stickered slots from drawn counts per grade — there is no stored sticker state; don't add one.
- **Sub-prizes are chosen, never drawn**: D/E/F grades (`SUB_PRIZE_GRADES`) may carry variant lists whose quantities sum exactly to the grade quantity (`validateConfig` enforces this). The draw decides only the grade; the player picks the variant in `SubPrizePicker`, written onto the draw record as `subPrizeName` by `selectSubPrize()`. Variant remaining stock is derived (round snapshot minus records) — no stored counters.
- **Sub-prize round snapshot**: `gameState.subPrizes` is copied from the config at round start, same lifecycle as the ticket pool; mid-round "Apply Changes" must not change running stock.
- **Pending-selection gate**: a committed draw of a sub-prized grade without `subPrizeName` is a pending selection (`getPendingSelections`, derived). `Game.jsx` reopens the picker for pendings on load and blocks all drawing until they're claimed — this keeps "variant total = win total" intact across reloads mid-claim.
- **Fixed grades**: `GRADES = A–F` is an enum; `GOLD_GRADES = A–C` drives gold vs silver styling across StickerBoard, ResultModal, DrawHistory, and PrizeEditor. The admin editor is six fixed rows plus Last One — no add/delete grade rows (sub-prize variant rows under D/E/F are the only variable-row UI).
- **Migration**: `version: 2` data upgrades to v3 losslessly and silently (empty `subPrizes`); anything older/malformed is reinitialized to defaults with a one-time notice flag (`consumeMigrationNotice()`). Any schema change should bump the version and extend this path rather than crash on old data.
- **Config vs round**: `setConfig()` (admin "Apply Changes") only writes the config; the running round is untouched until "New Round" regenerates the pool from it.

## OpenSpec workflow

Changes are spec-driven via OpenSpec (`openspec/` dir; the CLI is not a local dependency — use `npx -y @fission-ai/openspec@latest`). Main capability specs in `openspec/specs/` are the baseline; new work goes through `/opsx:propose` → `/opsx:apply` → `/opsx:archive` (slash commands in `.claude/commands/opsx/`). Completed changes live in `openspec/changes/archive/`.
