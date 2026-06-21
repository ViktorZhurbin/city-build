# CLAUDE.md

A deliberately minimal city-builder game, built to answer one question: is the core loop fun? Nothing else. This is a playable experiment, not a product. Coloured grid tiles with a letter or icon are the entire visual language.

> **Keep this file true.** It's the reference later threads (and we) lean on. Whenever a change makes something here no longer accurate — a renamed file, a dropped abstraction, a reworked rule — update the stale line in the same change, don't leave it for later.

## The whole game in one paragraph

There is a grid. The player places one of **four building types**: House, Store, Power Plant, Water Plant. There are **two resources** (power, water) plus **money**. Every ~1.5s a `tick()` advances the clock; `resolve()` recomputes the whole simulation from the buildings whenever they change.

The dependency chain is the engine:

> houses make people → people staff AND shop at stores → stores' commerce is taxed for money → money pays utility upkeep + buys expansion → utilities let you place more houses

All tunable numbers live in `game/balance.ts`.

## Design intent

A stripped-down SimCity / Cities: Skylines. We borrow their three economic pillars and nothing else:

1. Revenue is **demand-bound** — capped by `population` (`customersServed`, in `game/resolve.ts`), so it's sublinear while utility upkeep grows with the city. The two cross → there's an optimal city size, and overbuilding bleeds money.
2. **Utilities are sinks, never sources** — power/water cost to build _and_ an `upkeep` per day. Houses and stores carry no upkeep: **stores are the only income** (commerce tax), and houses feed them the people that income is bound to.
3. **Growth follows demand** (the RCI loop): houses ≈ Residential, stores ≈ Commercial; no Industrial. Stores want people (workers + customers), houses want jobs + utilities.

**Two clocks:** the _physical_ sim (power → water → jobs → customers) is pure — `resolve()` recomputes it from the buildings on demand, not on a timer. `tick()` (every ~1.5s) only advances the clock; money moves on the **day** boundary (`TICKS_PER_DAY`), when the budget settles as `revenue − upkeep`.

**Deferred** (noted inline where they'd go): an end-of-day budget sheet popup (SimCity-style revenue/expense breakdown); a player-set tax-rate slider (the income-vs-growth dial).

## Core mechanics (status quo — keep this current)

The concrete rules as they stand. **Update this section whenever mechanics change** — it's the reference later threads (and we) lean on.

- **Buildings (4).** _House_ — draws power+water, produces `population`. _Store_ — draws power+water, needs `jobsNeeded` workers, serves up to `customersServed` people (capped by total population), each taxed `taxPerCustomer`. _Power plant_ — produces `powerSupply`. _Water plant_ — produces `waterSupply`, but only while itself powered.
- **Sim resolution (`game/resolve.ts`), one pure pass in order:** (1) power allocated **greedily by placement order** — overflow buildings go dark; (2) water — only powered water plants produce, allocated the same greedy way; (3) jobs — `population` staffs powered+watered stores greedily, unstaffed stores sit idle; (4) customers — the same `population` shops, handed out greedily across active stores (what each store's revenue is bound to). Placement order mattering is a feature; these flags/numbers are **derived, never stored** on the building.
- **Money settles per day, not per tick.** Every `TICKS_PER_DAY` ticks: `money += revenue − upkeep`. `revenue` = served customers × tax — **stores are the only income**, houses just supply the people it's capped by; `upkeep` = **utilities only** (houses/stores carry no upkeep). Both are fields on `resolve()`'s `totals`.
- **Build / demolish.** Placing costs full price, blocked when unaffordable. Demolishing refunds `DEMOLISH_REFUND` of cost (the recovery lever) — bulldozer stays armed for repeat clears. No bankruptcy floor; money can go negative, but utilities-only upkeep + refund make recovery always reachable.
- **Controls & persistence.** Speed: pause / 1× / 2× / 3× scales the tick interval. The whole `City` (money, normalized buildings, tick) persists to `localStorage` (key `…:v2`) on every change; speed/selection are view state, not saved.

## Code architecture (`src/game/`)

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

## Code style

- **No single-letter variables.** Use descriptive names everywhere — parameters, locals, callbacks. `building` not `b`, `placed` not `x`, `cityStats` not `s`.
- **Extract boolean expressions into named variables.** Pull non-trivial conditions out of `if` statements. `const cellOccupied = ...` then `if (cellOccupied)`, not an inline predicate.
- add newlines before/after multiline expressions, code blocks, before return statements, etc.
- prefer `for...of` loop over `forEach` when index is not required.

## CSS conventions

- **Design tokens live in `App.css` `:root`** — colours, `--tile-size`, radii (`--radius`/`--radius-sm`), font sizes, transition durations. Reuse via `var(...)`; never hardcode a literal that already has a token.
- **Colours are OKLCH**, and a variant is **derived from its base** with `color-mix` (`*-hover`/`*-bright` = base + white, `*-dark` = base + black) so the relationship is visible in the code, not two unrelated hex values. The building palette (bright tile + dark toolbar swatch) shares one base this way.
- **Trim scattered values to a small scale.** If a kind of value (radius, font size, transition) appears with many slightly-different numbers, collapse them to 1–2 tokens and reuse — don't introduce a new one-off.
- **`rem` for `font-size` only** (respects browser zoom). Everything else — gap/margin/padding, width/height — is **`px`** (easier to reason about). The one exception is `--tile-size`, a px token shared by `Tile.css` and the grid track sizing.
- **Use native CSS nesting** for variants (`&[data-type="…"]`, `&:hover`) — keep it shallow (one level).
- **Classes are scoped to their own component.** Don't reach into another component's class from a different `.css` file; pass a `class` prop down instead if a parent must style a child.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000) - use NPM for dev
bun run build      # production build
bun run preview    # preview production build locally
bun run check      # Build, tsc, Biome (lint + format) (Biome writes fixes in place)
```

To verify changes, run `bun run check`.

## Stack

- **SolidJS** — reactive UI framework. JSX compiles via Babel (`pluginBabel` + `pluginSolid`). Use `class=` not `className=`, and SolidJS primitives (`createSignal`, `createEffect`, etc.) rather than React hooks.
- **Rsbuild v2** — Rspack-based bundler. Config lives in `rsbuild.config.ts`. Docs: https://rsbuild.rs/llms.txt / https://rspack.rs/llms.txt
- **TypeScript 6.0** — strict by default (`strict: true` is the TS 6 default, not set explicitly). `jsxImportSource` is `solid-js`; `jsx: "preserve"` means Babel handles the transform.

## Rsbuild config notes

- Babel is scoped to `.jsx`/`.tsx` only — plain `.ts`/`.js` goes through the default SWC transform.
- No explicit `source.entry` — defaults to `src/index.tsx`.
- No `@rsbuild/plugin-type-check` installed; run `tsc --noEmit` separately.
