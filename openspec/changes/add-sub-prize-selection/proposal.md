# Proposal: Sub-Prize Selection for D/E/F 賞

## Why

In a real ichiban kuji, lower tiers (D賞–F賞) are usually a *category* of item that comes in several variants — e.g. E賞 "造型毛巾" may have four different designs. The ticket only says "E賞"; after winning, the player picks whichever variant they like from the remaining stock on the shelf. The simulator currently treats each grade as a single item, so this whole "win the tier, then choose your variant" experience is missing.

## What Changes

- D賞/E賞/F賞 can each be configured with **sub-prizes** (variants): a list of `{ name, quantity }` rows whose quantities MUST sum exactly to the parent grade's quantity. A賞–C賞 stay single-item tiers.
- The draw reveal is unchanged: tearing the sticker shows only the grade (e.g. "E賞") and the parent prize name — the sub-prize is never decided by the draw.
- After a revealed draw of a grade that has sub-prizes, a **sub-prize pool UI** appears showing each variant with its remaining stock; the player **chooses** one (no randomness). Choosing decrements that variant's stock for the round.
- Sub-prize choices are appended to the draw's history record (`subPrizeName`) and shown in the draw history.
- If the player reloads before choosing (the draw itself is already committed), the unchosen wins are surfaced as **pending selections** the player must complete before drawing again.
- Admin editor gains an expandable sub-prize section under the D/E/F rows with add/remove variant rows, live sub-total vs parent quantity, and validation (**sum must equal parent quantity**, names required).
- localStorage schema bumps to **version 3**: config gains optional `subPrizes` per D/E/F grade; game state snapshots the sub-prize list at round start; v2 data upgrades losslessly (no reset), v1/unknown still reinitializes with the one-time notice.

## Capabilities

### New Capabilities

- `sub-prize-selection`: The post-reveal variant-selection flow — sub-prize pool UI, remaining-stock display, stock depletion, pending-selection handling across reloads, and 5連抽 interaction (one selection per sub-prized win).

### Modified Capabilities

- `admin-configuration`: D/E/F rows gain a sub-prize variant editor (add/remove rows); validation adds "sub-prize quantities sum to parent quantity" and per-variant name rules.
- `data-persistence`: Schema v3 — config `subPrizes`, game-state sub-prize snapshot, records gain `subPrizeName`; lossless v2→v3 migration alongside the existing v1 reset path.
- `lottery-draw`: History records and the history panel include the chosen sub-prize; reveal explicitly shows only the parent grade/prize for sub-prized grades.
- `game-reset`: New Round snapshots the latest sub-prize configuration into the fresh round state and clears all selections/pending selections.

## Impact

- `src/utils/storage.js` — schema v3, sub-prize snapshot, selection write (`selectSubPrize`), derived remaining-stock helper, pending-selection helper, validation, v2→v3 migration. Remaining stock is **derived** from records (config quantity − chosen count), consistent with the derived-sticker-state philosophy.
- `src/components/PrizeEditor.jsx` — sub-prize editor rows under D/E/F (first variable-row UI in the editor; the six grade rows stay fixed).
- `src/pages/Game.jsx`, `src/components/ResultModal.jsx` — reveal flow chains into selection; pending-selection gate.
- New component: `SubPrizePicker` (the sub-prize pool UI).
- `src/components/DrawHistory.jsx` — sub-prize column/annotation.
- No backend, no routing, no deploy changes.
