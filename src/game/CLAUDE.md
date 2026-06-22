# Sim architecture

The sim is split by role so the rules live in exactly one place. Resist re-adding
the old pattern of per-question selectors that each re-walk the buildings.

- **`state.ts`** — the durable, persisted truth: `City { money, tick, population, buildings }`, where `buildings` is normalized as `{ ids, entities }`. A `Building` is just `{ type, pos }` (`pos` doubles as the entity id). `ids` is placement order — **load-bearing** (every greedy pass uses it) and **never sorted**. `population` is the one stored value with _history_ (a living stock, not derived from buildings). Entity helpers: `addOne` / `removeOne` / `selectAll` / `has`.
- **`resolve.ts`** — the engine. `resolve(buildings, population)` runs the whole physical sim in **one pass** → `Resolved { ids, entities, totals }`. Pure over its inputs, but `population` is one of them (the stock, advanced elsewhere). Internally it's a chain of sequential greedy passes — power → water → capacity → jobs → customers — each its own walk over the buildings in placement order, reading the flags the prior pass set and writing its own onto the building (atomic all-or-nothing for power/water/jobs, divisible partial fills for customers). The passes must run in order: each fully settles before the next. The houses pass derives **`capacity`** (the ceiling population chases); jobs/customers draw on the passed-in stock. **Derived state lives here, never on the building**: `powered/watered/staffed/customers/revenue/upkeep` and `capacity` are recomputed, not stored — only `population` is persisted.
- **`selectors.ts`** — read path: `toCityStats` (HUD), `toCells` (grid). Pure projections of a `Resolved`; no rules.
- **`reducers.ts`** — write path, the only producers of a new `City`: `place` / `demolish` (player commands) and `tick` (the clock — advances the counter; on the day boundary settles money _and_ drifts `population` one step toward capacity, both via `resolve`).
- **`storage.ts`** — localStorage; bump the key suffix (`…:v3`) on any incompatible `City` shape change.
- **`balance.ts`** — the tuning knobs. Numbers only, no logic.
- **`types.ts`** — shared cross-module types (e.g. `Tool`).

`App.tsx` wires it: `resolve` runs inside a `createMemo` over `city.buildings` and `city.population` (the selector cache), feeding both the HUD and the tiles. Because flags are derived, a newly-placed building shows correct state immediately, not on the next tick.
