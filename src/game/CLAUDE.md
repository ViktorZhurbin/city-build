# Sim architecture

The sim is split by role so the rules live in exactly one place. Resist re-adding
the old pattern of per-question selectors that each re-walk the buildings.

- **`state.ts`** — the durable, persisted truth: `City { money, tick, buildings }`, where `buildings` is normalized as `{ ids, entities }`. A `Building` is just `{ type, pos }` (`pos` doubles as the entity id). `ids` is placement order — **load-bearing** (every greedy pass uses it) and **never sorted**. Entity helpers: `addOne` / `removeOne` / `selectAll` / `has`.
- **`resolve.ts`** — the engine. `resolve(buildings)` runs the whole physical sim in **one pure pass** → `Resolved { ids, entities, totals }`. Internally it's a chain of sequential greedy passes — power → water → population → jobs → customers — each its own walk over the buildings in placement order, reading the flags the prior pass set and writing its own onto the building (atomic all-or-nothing for power/water/jobs, divisible partial fills for customers). The passes must run in order: each fully settles before the next. **Derived state lives here, never on the building**: `powered/watered/active/population/customers/revenue/upkeep` are recomputed, not stored or persisted.
- **`selectors.ts`** — read path: `toCityStats` (HUD), `toCells` (grid). Pure projections of a `Resolved`; no rules.
- **`reducers.ts`** — write path, the only producers of a new `City`: `place` / `demolish` (player commands) and `tick` (the clock — advances the counter; settles money via `resolve` on the day boundary).
- **`storage.ts`** — localStorage; bump the key suffix (`…:v2`) on any incompatible `City` shape change.
- **`balance.ts`** — the tuning knobs. Numbers only, no logic.
- **`types.ts`** — shared cross-module types (e.g. `Tool`).

`App.tsx` wires it: `resolve` runs inside a `createMemo` over `city.buildings` (the selector cache), feeding both the HUD and the tiles. Because flags are derived, a newly-placed building shows correct state immediately, not on the next tick.
