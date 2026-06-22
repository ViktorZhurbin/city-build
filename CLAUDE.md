# CLAUDE.md

A deliberately minimal city-builder game, built to answer one question: is the core loop fun? Nothing else. This is a playable experiment, not a product. Coloured grid tiles with a letter or icon are the entire visual language.

> **Keep this file true.** It's the reference later threads (and we) lean on. Whenever a change makes something here no longer accurate — a renamed file, a dropped abstraction, a reworked rule — update the stale line in the same change, don't leave it for later.

## The whole game in one paragraph

There is a grid. The player places one of **four building types**: House, Store, Power Plant, Water Plant. There are **two resources** (power, water) plus **money**. Every ~1.5s a `tick()` advances the clock; `resolve()` recomputes the physical simulation from the buildings (plus the stored population stock) whenever anything changes.

The dependency chain is the engine:

> houses raise housing capacity → population drifts up to fill it → people staff AND shop at stores → stores' commerce is taxed for money → money pays utility upkeep + buys expansion → utilities let you place more houses

All tunable numbers live in `game/balance.ts`.

## Design intent

A stripped-down SimCity / Cities: Skylines. We borrow their three economic pillars and nothing else:

1. Revenue is **demand-bound** — capped by `population` (`customersServed`, in `game/resolve.ts`), so it's sublinear while utility upkeep grows with the city. The two cross → there's an optimal city size, and overbuilding bleeds money.
2. **Utilities are sinks, never sources** — power/water cost to build _and_ an `upkeep` per day. Houses and stores carry no upkeep: **stores are the only income** (commerce tax), and houses feed them the people that income is bound to.
3. **Growth follows demand** (the RCI loop): houses ≈ Residential, stores ≈ Commercial; no Industrial. Stores want people (workers + customers), houses want jobs + utilities.

**Two clocks:** the _physical_ sim (power → water → capacity → jobs → customers) is pure — `resolve(buildings, population)` recomputes it on demand, not on a timer. It's pure over its _inputs_, but those now include the **stored population stock** (the one piece of state with history, not derived from the buildings). `tick()` (every ~1.5s) only advances the clock; on the **day** boundary (`TICKS_PER_DAY`) two stored things settle: money (`revenue − upkeep`) and population (one drift step toward housing capacity).

**Deferred** (noted inline where they'd go): an end-of-day budget sheet popup (SimCity-style revenue/expense breakdown); a player-set tax-rate slider (the income-vs-growth dial).

## Core mechanics (status quo — keep this current)

The concrete rules as they stand. **Update this section whenever mechanics change** — it's the reference later threads (and we) lean on.

- **Buildings (4).** _House_ — draws power+water, raises housing `capacity` (people the city can hold). _Store_ — draws power+water, needs `jobsNeeded` workers, serves up to `customersServed` people (capped by living population), taxed at the city-wide `TAX_RATE`. _Power plant_ — produces `powerSupply`. _Water plant_ — produces `waterSupply`, but only while itself powered.
- **Population is a living stock**, not the instant sum of houses: stored on `City`, it drifts one bounded step per day toward housing capacity — filling slowly, emptying faster when capacity drops below it (a brownout or bulldozed plant). It's what staffs and shops; capacity is only the ceiling it chases.
- **Sim resolution (`game/resolve.ts`), one pass in order:** (1) power allocated **greedily by placement order** — overflow buildings go offline; (2) water — only powered water plants produce, allocated the same greedy way; (3) capacity — online houses sum the housing ceiling; (4) jobs — the living `population` staffs powered+watered stores greedily, unstaffed stores sit idle; (5) customers — the same `population` shops, handed out greedily across active stores (what each store's revenue is bound to). Placement order mattering is a feature; every flag/number here is **derived, never stored** — except the `population` input, which has history.
- **Money settles per day, not per tick.** Every `TICKS_PER_DAY` ticks: `money += revenue − upkeep` and population drifts one step. `revenue` = served customers × `TAX_RATE` — **stores are the only income**, houses just supply the people it's capped by; `upkeep` = **utilities only** (houses/stores carry no upkeep). Both are fields on `resolve()`'s `totals`.
- **Build / demolish.** Placing costs full price, blocked when unaffordable. Demolishing refunds `DEMOLISH_REFUND` of cost (the recovery lever) — bulldozer stays armed for repeat clears. No bankruptcy floor; money can go negative, but utilities-only upkeep + refund make recovery always reachable.
- **Controls & persistence.** Speed: pause / 1× / 2× / 3× scales the tick interval. The whole `City` (money, tick, population, normalized buildings) persists to `localStorage` (key `…:v3`) on every change; speed/selection are view state, not saved.

## Code architecture (`src/game/`)

File responsibilities and architectural constraints are in `src/game/CLAUDE.md`.

## Code style

- **No single-letter variables.** Use descriptive names everywhere — parameters, locals, callbacks. `building` not `b`, `placed` not `x`, `cityStats` not `s`.
- **Extract boolean expressions into named variables.** Pull non-trivial conditions out of `if` statements. `const cellOccupied = ...` then `if (cellOccupied)`, not an inline predicate.
- add newlines before/after multiline expressions, code blocks, before return statements, etc.
- prefer `for...of` loop over `forEach` when index is not required.

## CSS conventions

CSS conventions are in `src/components/CLAUDE.md`.

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
