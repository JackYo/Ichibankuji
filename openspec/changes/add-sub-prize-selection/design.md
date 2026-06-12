# Design: Sub-Prize Selection for D/E/F 賞

## Context

The simulator (schema v2) treats each grade as a single prize. Real kuji lower tiers come in variants the winner picks from the shelf. The system already has strong invariants worth preserving: `storage.js` is the only localStorage toucher, draws are atomic batch writes, sticker state is derived (never stored), and the round is a snapshot insulated from mid-round config edits. Sub-prizes must slot into those patterns rather than invent new ones.

## Goals / Non-Goals

**Goals:**
- D/E/F grades optionally carry variants; variant quantities sum exactly to the grade quantity.
- Draw decides only the grade; the player chooses the variant from remaining stock afterwards.
- Survive reloads at any point (including between commit and choice) without losing or duplicating anything.
- Lossless v2→v3 upgrade — existing rounds keep running.

**Non-Goals:**
- Variants for A/B/C賞 or the Last One 賞.
- Random variant assignment or an "auto-pick" convenience.
- Showing variant stock on the sticker board (the picker is the stock display).
- Variant images — names only, consistent with the rest of the app.

## Decisions

1. **Variant stock is derived, not stored.** Remaining stock = snapshot quantity − count of records with that `subPrizeName` for that grade. Mirrors the derived-sticker-state decision; one less thing to keep consistent, and reload-correct by construction. Alternative (stored counters) rejected: a second mutable source of truth that can drift from records.

2. **Selection is written onto the draw record (`subPrizeName`).** The record is the natural owner — it already identifies the win — and it gives history display for free. Alternative (separate `selections` array keyed by ticketId) rejected: a join for no benefit.

3. **Pending selection = committed record of a sub-prized grade with no `subPrizeName`.** Derived, reload-safe, no extra flag. Drawing is gated while any pending exists, so the invariant "every sub-prized win has a recorded choice before play continues" holds round-wide. The gate lives in `Game.jsx` (refuse to start a draw) backed by a `getPendingSelections(state)` helper in storage.

4. **Sub-prize lists are snapshotted into `gameState.subPrizes` at round start**, same lifecycle as the ticket pool. Mid-round "Apply Changes" cannot change running stock totals — otherwise the sum invariant (variants = wins) could break mid-round. Display names for the picker come from the snapshot too.

5. **Draw commit stays atomic and unchanged in shape**; selection is a separate single write (`selectSubPrize(ticketId, variantName)`) that validates: record exists, grade has variants, record has no choice yet, variant exists in snapshot, derived stock > 0. In a 5連抽, the five-draw commit happens first (existing path); selections then trickle in one write each as the player picks during the sequential reveal. A reload mid-batch-reveal leaves N pending selections, which the gate surfaces — no partial-draw risk.

6. **Picker placement: chained into the reveal modal flow.** After a sub-prized result's flip, the modal's continue button leads to the variant picker for that result; picking advances to the next reveal (or closes). On load with pendings, the same picker opens standalone for each pending in record order. Alternative (pick later at leisure) rejected: indefinite unchosen wins complicate stock maths and the user explicitly framed selection as part of opening the prize.

7. **Schema v3 with lossless v2 upgrade.** v2 → add `subPrizes: []` per grade / `{}` on state, rewrite as v3, no notice. v1/malformed keeps the existing reset+notice path. `SCHEMA_VERSION = 3`; the v2 upgrade is a small pure function so the storage-test harness can cover it. Alternative (stay v2, treat fields as optional) rejected: version field exists precisely to make shape changes explicit.

8. **Validation: variants are all-or-nothing per grade.** 0 rows = single-item grade (back-compat default); ≥1 row ⇒ every row has non-empty name + integer quantity ≥ 1, and Σ = parent quantity. Quantity-0 grade must have no rows. Duplicate variant names within a grade are rejected (stock derivation counts by name).

## Risks / Trade-offs

- [Draw gate adds a new "can't draw" state players may not expect] → The picker auto-opens for pendings on load and the pool shows a clear "complete your prize selection" hint, so the blocked state is self-explanatory and momentary.
- [Counting records by variant name on every render is O(records × variants)] → Round max is 200 tickets; trivial. Keep helper pure and call it from render like `getDrawnCountByGrade`.
- [Two-step persistence (commit, then choice) means crash-in-between is normal, not exceptional] → That is exactly what the pending-selection derivation models; tested explicitly with a reload-mid-modal probe.
- [Renaming a variant in config mid-round could orphan record names] → Irrelevant by design: running round reads names only from its own snapshot (Decision 4).

## Migration Plan

Ship in one deploy. On first load, v2 data silently upgrades to v3 (Decision 7); rollback to a previous build would see `version: 3` and hit the reset+notice path — acceptable for a toy app, noted here as the rollback cost.

## Open Questions

None.
