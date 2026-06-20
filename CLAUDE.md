# CLAUDE.md

A deliberately minimal city-builder game, built to answer one question: is the core loop fun? Nothing else. This is a playable experiment, not a product. Coloured grid tiles with a letter or icon are the entire visual language.

## The whole game in one paragraph

There is a grid. The player places one of **four building types**: House, Store, Power Plant, Water Plant. There are **two resources** (power, water) plus **money**. Every ~1.5s a `tick()` recalculates the whole simulation.

The dependency chain is the engine:

> houses make people → people staff AND shop at stores → stores' commerce is taxed for money → money pays utility upkeep + buys expansion → utilities let you place more houses

All tunable numbers live in the `CONFIG.ts`. Balance happens there, nowhere else.

## Design intent

A stripped-down SimCity / Cities: Skylines. We borrow their three economic pillars and nothing else:

1. Revenue is **demand-bound** — capped by `population` (`customersServed` in `simulation.ts`), so it's sublinear while utility upkeep grows with the city. The two cross → there's an optimal city size, and overbuilding bleeds money.
2. **Utilities are sinks, never sources** — power/water cost to build _and_ an `upkeep` per day. Houses and stores carry no upkeep: **stores are the only income** (commerce tax), and houses feed them the people that income is bound to.
3. **Growth follows demand** (the RCI loop): houses ≈ Residential, stores ≈ Commercial; no Industrial. Stores want people (workers + customers), houses want jobs + utilities.

**Two clocks:** every ~1.5s a `tick()` runs the _physical_ sim (power → water → jobs allocation). Money only moves on the **day** boundary (`TICKS_PER_DAY`), when the budget settles as `revenue − upkeep`.

**Deferred** (noted inline where they'd go): an end-of-day budget sheet popup (SimCity-style revenue/expense breakdown); a player-set tax-rate slider (the income-vs-growth dial).

## Core mechanics (status quo — keep this current)

The concrete rules as they stand. **Update this section whenever mechanics change** — it's the reference later threads (and we) lean on. Numbers live in `CONFIG.ts`.

- **Buildings (4).** _House_ — draws power+water, produces `population`. _Store_ — draws power+water, needs `jobsNeeded` workers, serves up to `customersServed` people (capped by total population), each taxed `taxPerCustomer`. _Power plant_ — produces `powerSupply`. _Water plant_ — produces `waterSupply`, but only while itself powered.
- **Tick resolution (`tick.ts`), in order:** (1) power allocated **greedily by placement order** — overflow buildings go dark; (2) water — only powered water plants produce, allocated the same greedy way; (3) jobs — `population` staffs powered+watered stores greedily, unstaffed stores sit idle. Placement order mattering is a feature.
- **Money settles per day, not per tick.** Every `TICKS_PER_DAY` ticks: `money += revenue − upkeep`. `revenue` = served customers × tax (`totalRevenue`) — **stores are the only income**, houses just supply the people it's capped by; `upkeep` = **utilities only** (`totalUpkeep` — houses/stores carry no upkeep). Both live in `simulation.ts`.
- **Build / demolish.** Placing costs full price, blocked when unaffordable. Demolishing refunds `DEMOLISH_REFUND` of cost (the recovery lever) — bulldozer stays armed for repeat clears. No bankruptcy floor; money can go negative, but utilities-only upkeep + refund make recovery always reachable.
- **Controls & persistence.** Speed: pause / 1× / 2× / 3× scales the tick interval. The whole `City` (money, buildings, tick) persists to `localStorage` on every change; speed/selection are view state, not saved.

## Code style

- **No single-letter variables.** Use descriptive names everywhere — parameters, locals, callbacks. `building` not `b`, `placed` not `x`, `cityStats` not `s`.
- **Extract boolean expressions into named variables.** Pull non-trivial conditions out of `if` statements. `const cellOccupied = ...` then `if (cellOccupied)`, not an inline predicate.
- add newlines before/after multiline expressions, code blocks, before return statements, etc;

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000) - use NPM for dev
bun run build      # production build
bun run preview    # preview production build locally
bun run check      # Biome (lint + format) and tsc (Biome writes fixes in place)
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
