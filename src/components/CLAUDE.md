# CSS conventions

- **Design tokens live in `App.css` `:root`** — colours, `--tile-size`, radii (`--radius`/`--radius-sm`), font sizes, transition durations. Reuse via `var(...)`; never hardcode a literal that already has a token.
- **Colours are OKLCH**, and a variant is **derived from its base** with `color-mix` (`*-hover`/`*-bright` = base + white, `*-dark` = base + black) so the relationship is visible in the code, not two unrelated hex values. The building palette (bright tile + dark toolbar swatch) shares one base this way.
- **Trim scattered values to a small scale.** If a kind of value (radius, font size, transition) appears with many slightly-different numbers, collapse them to 1–2 tokens and reuse — don't introduce a new one-off.
- **`rem` for `font-size` only** (respects browser zoom). Everything else — gap/margin/padding, width/height — is **`px`** (easier to reason about). The one exception is `--tile-size`, a px token shared by `Tile.css` and the grid track sizing.
- **Use native CSS nesting** for variants (`&[data-type="…"]`, `&:hover`) — keep it shallow (one level).
- **Classes are scoped to their own component.** Don't reach into another component's class from a different `.css` file; pass a `class` prop down instead if a parent must style a child.
