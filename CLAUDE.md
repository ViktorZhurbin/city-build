# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are an expert in JavaScript, Rsbuild, and web application development. Write maintainable, performant, and accessible code.

## Commands

```bash
bun run dev        # start dev server (http://localhost:3000)
bun run build      # production build
bun run preview    # preview production build locally
bun run check      # Biome: lint + format (writes fixes in place)
tsc                # type check (noEmit is set in tsconfig; no type-check plugin configured)
```

## Stack

- **SolidJS** — reactive UI framework. JSX compiles via Babel (`pluginBabel` + `pluginSolid`). Use `class=` not `className=`, and SolidJS primitives (`createSignal`, `createEffect`, etc.) rather than React hooks.
- **Rsbuild v2** — Rspack-based bundler. Config lives in `rsbuild.config.ts`. Docs: https://rsbuild.rs/llms.txt / https://rspack.rs/llms.txt
- **TypeScript 6.0** — strict by default (`strict: true` is the TS 6 default, not set explicitly). `jsxImportSource` is `solid-js`; `jsx: "preserve"` means Babel handles the transform.

## Architecture

This is a minimal single-page app. The entry point (`src/index.tsx`) mounts `<App />` into `#root`. All app logic goes in `src/`.

## Rsbuild config notes

- Babel is scoped to `.jsx`/`.tsx` only — plain `.ts`/`.js` goes through the default SWC transform.
- No explicit `source.entry` — defaults to `src/index.tsx`.
- No `@rsbuild/plugin-type-check` installed; run `tsc --noEmit` separately.
