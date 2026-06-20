# CLAUDE.md

A deliberately minimal city-builder game, built to answer one question: is the core loop fun? Nothing else. This is a playable experiment, not a product. Coloured grid tiles with a letter or icon are the entire visual language.

## The whole game in one paragraph

There is a grid. The player places one of **four building types**: House, Store, Power Plant, Water Plant. There are **two resources** (power, water) plus **money**. Every ~1.5s a `tick()` recalculates the whole simulation.

The dependency chain is the engine:

> houses make people → people staff stores → stores make money → money buys utilities → utilities let you place more houses

All tunable numbers live in the `CONFIG.ts`. Balance happens there, nowhere else.

## Commands

```bash
bun run dev        # start dev server (http://localhost:3000)
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
