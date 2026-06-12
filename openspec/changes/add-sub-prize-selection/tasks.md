# Tasks: Sub-Prize Selection for D/E/F 賞

## 1. Storage layer (schema v3)

- [x] 1.1 Bump `SCHEMA_VERSION` to 3; add `SUB_PRIZE_GRADES = ['D','E','F']` constant
- [x] 1.2 Add empty `subPrizes: []` to each grade in `DEFAULT_CONFIG` (defaults stay single-item)
- [x] 1.3 Implement lossless v2→v3 upgrade in `getConfig`/`getGameState` (add empty `subPrizes`, rewrite as v3, no notice); keep v1/malformed → reset + one-time notice (now reinitializing to v3 defaults)
- [x] 1.4 Snapshot config sub-prize lists into `gameState.subPrizes` in `initializeGameState`/`resetGameState`
- [x] 1.5 Add `getSubPrizeStock(state, grade)` — per-variant `{ name, total, remaining }` derived from snapshot quantity minus records' `subPrizeName` counts
- [x] 1.6 Add `getPendingSelections(state)` — records of sub-prized grades lacking `subPrizeName`, in record order
- [x] 1.7 Add `selectSubPrize(ticketId, variantName)` — validate (record exists, grade sub-prized, no prior choice, variant in snapshot, derived stock > 0), write `subPrizeName` onto the record in one localStorage write, return updated state
- [x] 1.8 Extend `validateConfig`: per D/E/F grade with ≥1 variant — non-empty unique names, integer quantity ≥ 1, Σ variants = parent quantity; quantity-0 grade must have no variants
- [x] 1.9 Node logic test (mocked localStorage): v2→v3 upgrade keeps tickets/records; stock derivation; selectSubPrize happy path + each rejection; pending detection; validation matrix; reset re-snapshots and clears pendings

## 2. Sub-prize picker UI

- [x] 2.1 Create `SubPrizePicker.jsx` + `.css` — modal panel listing the grade's variants with name + remaining/total, out-of-stock variants visible but disabled, tap to claim (explicit pick even when one variant remains)
- [x] 2.2 Style to match existing modal/kuji aesthetic; silver-tier accent (sub-prizes only exist on D/E/F)

## 3. Game flow integration

- [x] 3.1 Chain picker into the reveal flow in `Game.jsx`/`ResultModal.jsx`: after a sub-prized result's flip, continue button leads to the picker; picking advances to the next reveal or closes the modal
- [x] 3.2 Mid-batch stock: picker reads live derived stock so the 2nd E賞 pick in a 5連抽 sees the 1st pick's depletion
- [x] 3.3 On Game mount (and after any state reload), open the picker for pending selections in record order before allowing interaction
- [x] 3.4 Gate draws while pendings exist: single tap and 5連抽 picks refuse to start, with a visible "complete your prize selection" hint on the pool
- [x] 3.5 `DrawHistory.jsx`: show the chosen variant alongside grade/prize (and blank/pending state before choice)

## 4. Admin editor

- [x] 4.1 `PrizeEditor.jsx`: expandable sub-prize section on D/E/F rows only — add/remove/edit variant rows (name, quantity)
- [x] 4.2 Live sub-total indicator per section (e.g. "15/20") that flags mismatch as the admin types
- [x] 4.3 Per-variant and per-section validation errors wired to extended `validateConfig`; apply blocked on error
- [x] 4.4 Save v3 config; confirm next-round note still shown; current round untouched

## 5. Verification (Playwright msedge + Node)

- [x] 5.1 Run storage logic test from 1.9 in Node
- [x] 5.2 UI flow: configure E賞 with 4 variants in admin → new round → draw until E賞 → reveal shows only "E賞" → picker appears → claim variant → history shows it, stock decremented
- [x] 5.3 Reload-mid-modal probe: draw sub-prized grade, reload before choosing → picker reopens, drawing blocked until claimed
- [x] 5.4 5連抽 probe: batch with multiple sub-prized wins → one picker per win in order, mid-batch stock depletion visible
- [x] 5.5 v2→v3 probe: plant v2 mid-round data, reload → round continues, no notice; plant v1 data → reset + notice
- [x] 5.6 Admin validation probe: variant sum ≠ parent blocked; unnamed variant blocked; production build passes

## 6. Docs

- [x] 6.1 Update README.md (sub-prize feature) and CLAUDE.md invariants (schema v3, derived variant stock, pending-selection gate)
