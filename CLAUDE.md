# CLAUDE.md

A deliberately minimal city-builder game, built to answer one question: is the core loop fun? Nothing else. This is a playable experiment, not a product. Coloured grid tiles with a letter or icon are the entire visual language.

## The whole game in one paragraph

There is a grid. The player places one of **four building types**: House, Store, Power Plant, Water Plant. There are **two resources** (power, water) plus **money**. Every ~1.5s a `tick()` recalculates the whole simulation.

The dependency chain is the engine:

> houses make people → people staff AND shop at stores → stores' commerce is taxed for money → money pays utility upkeep + buys expansion → utilities let you place more houses

All tunable numbers live in the `CONFIG.ts`. Balance happens there, nowhere else.

## Design intent

A stripped-down SimCity / Cities: Skylines. We borrow their three economic pillars and nothing else:

1. Revenue is **demand-bound** — capped by `population` (`customersServed` in `simulation.ts`), so it's sublinear while upkeep is linear per building. The two cross → there's an optimal city size, and overbuilding bleeds money.
2. **Utilities are sinks, never sources** — power/water cost to build _and_ an `upkeep` per day.
3. **Growth follows demand** (the RCI loop): houses ≈ Residential, stores ≈ Commercial; no Industrial. Stores want people (workers + customers), houses want jobs + utilities.

**Two clocks:** every ~1.5s a `tick()` runs the _physical_ sim (power → water → jobs allocation). Money only moves on the **day** boundary (`TICKS_PER_DAY`), when the budget settles as `revenue − upkeep`. The day is a bare counter today; see the "later" notes below.

**Deliberately deferred** (noted inline where they'd go): a visible day number + end-of-day budget sheet; a player-set tax-rate slider (the income-vs-growth dial).

## Code style

- **No single-letter variables.** Use descriptive names everywhere — parameters, locals, callbacks. `building` not `b`, `placed` not `x`, `cityStats` not `s`.
- **Extract boolean expressions into named variables.** Pull non-trivial conditions out of `if` statements. `const cellOccupied = ...` then `if (cellOccupied)`, not an inline predicate.

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
