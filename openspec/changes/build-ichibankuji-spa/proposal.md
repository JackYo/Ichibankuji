# Proposal: Ichibankuji Lottery Simulation Web App (Realistic Kuji Experience)

## Why

Deploy a lottery simulation (一番賞) web application on GitHub Pages, working within its static-only hosting model.

The first iteration shipped a generic "click a button, get a weighted random prize" flow. This is too far from a real ichiban kuji: in real life there is a sealed ticket pool (籤箱) where the player physically picks one ticket from the remaining set, and a prize board (賞品一覽表) where staff paste a sticker (貼紙) over each claimed prize slot. This change reworks the app to **simulate the real ticket-drawing and sticker-pasting experience**, with prizes organized into standard grades **A賞–F賞**, all manageable from a dedicated `/admin` page.

## What Changes

1. **Prize grades A–F** — **BREAKING**: prizes are no longer free-form rows; they are six fixed tiers (A賞 through F賞), each with configurable content (prize name/description) and quantity. The old config/state schema is replaced (schema v2) and existing localStorage data is migrated or reinitialized.
2. **Realistic ticket-pool draw (抽籤)** — replace the single "Draw" button with a visual pool of face-down sealed tickets. The pool is pre-shuffled at round start (each ticket's grade is fixed once shuffled, exactly like a real kuji box); the player picks a specific ticket and a reveal animation shows its grade and prize.
3. **Sticker board (貼貼紙)** — a prize board listing every grade with one slot per ticket; when a prize is claimed, a sticker is pasted onto the corresponding slot with an animation, so anyone can see at a glance what remains. Stickers are **gold for A賞–C賞** and **silver for D賞–F賞**.
4. **Multi-draw (5連抽)** — in addition to single draws, the player can pick five tickets in one go; the five results are revealed in sequence and recorded together.
5. **Last One 賞** — the player who draws the final ticket in the pool additionally wins the Last One prize, configured in `/admin` and shown as a dedicated row on the sticker board.
6. **Expanded `/admin` page** — the existing password-protected `/admin` route becomes a grade-tier manager: edit each grade's prize content and quantity plus the Last One prize, see total ticket count, and apply the configuration for the next round.
7. **Round reset reshuffles the pool** — "New Round" regenerates and reshuffles the ticket pool from the (possibly updated) admin configuration, clears all stickers, and restores the Last One prize to unclaimed.

Carried over unchanged from the original proposal: localStorage-only persistence, draw history tracking, confirmation-guarded round reset, frontend password gate for admin.

## Capabilities

### New Capabilities
- `sticker-board`: Prize board showing all grades and per-ticket slots, with gold (A–C) / silver (D–F) stickers pasted over claimed slots in real time, plus a Last One 賞 row.

### Modified Capabilities
- `lottery-draw`: Draw mechanic changes from button-triggered weighted random selection to picking specific tickets from a pre-shuffled, visualized ticket pool with a reveal step — one at a time or five at once (5連抽) — and the final ticket additionally awards the Last One prize.
- `admin-configuration`: Prize editor changes from free-form prize rows to fixed A–F grade tiers, each with content and quantity fields, plus a Last One prize content field.
- `data-persistence`: Storage schema v2 — grade-based configuration (including the Last One prize) and a persisted shuffled ticket pool replace the name-keyed quantities map.
- `game-reset`: Reset now regenerates and reshuffles the ticket pool and clears the sticker board, in addition to clearing history.

## Impact

- **Code**: `src/utils/storage.js` (schema v2 + migration), `src/pages/Game.jsx` (ticket pool + sticker board layout), `src/pages/Admin.jsx` and `src/components/PrizeEditor.jsx` (grade-tier editor), `src/components/DrawButton.jsx` (replaced by ticket pool component), `src/components/ResultModal.jsx` (reveal animation), `src/components/PrizeGrid.jsx` (becomes sticker board). New components: `TicketPool`, `StickerBoard`.
- **Data**: **BREAKING** localStorage schema change (`ichibankuji_config`, `ichibankuji_gameState`); v1 data without grade info is reinitialized to the default A–F sample configuration.
- **Dependencies**: none added; animations via CSS transitions.
- **Deployment**: unchanged (GitHub Pages static build).

## Schema

spec-driven change workflow
