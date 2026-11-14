# Tech Stack

## Build System (SSG)
- **Runtime**: Node.js
- **Language**: TypeScript (compiled via `ts-node` or `tsx` for simplicity)
- **Dependencies**:
  - `marked`: Robust Markdown parser.
  - `glob`: File pattern matching.
  - `gray-matter`: YAML frontmatter parser.
  - `@types/node`: Type definitions.

## Frontend
- **HTML**: Semantic HTML5.
- **CSS**: Vanilla CSS in one file (`assets/style.css`), organised with cascade layers (`@layer reset, tokens, state, base, layout, components, prose, utilities`) and a three-tier token system (primitives → semantic → component). Mobile first, one breakpoint at `48rem`. Needs `light-dark()`, `color-mix()` and `:has()` (all browsers from 2024); older browsers fall back to the light theme.
- **JS**: Optional only. Every feature works with JS disabled; the single exception is *remembering* the theme choice:
  - Folders: native `<details>/<summary>`.
  - Sidebar collapse (desktop) / drawer (mobile): a single checkbox + `<label>`s.
  - Theme: colours are `light-dark()` pairs driven by `color-scheme` on `:root`. Default follows the OS; `theme` in `patra.config.json` forces one (`data-theme` on `<html>`).
  - Theme toggle (sidebar footer): a checkbox that flips the theme via `:has()` with no JS (per page). Two tiny inline scripts in `template.html` save the choice to `localStorage` and restore it before first paint.
- **Assets**: No CDN requests. System font stack, inline SVG icons (`.icon`). Core stylesheet `assets/style.css` → `public/_patra/style.css`, plus an optional, unlayered `assets/custom.css` for user overrides (linked only when it exists).
- **Code blocks**: Plain styled `<pre>` (no syntax highlighting yet; a build-time highlighter would be the JS-free way to add it).

## Constraints
- **NO Frameworks**: No React, Vue, Svelte, Tailwind, Bootstrap.
- **NO Bundlers**: No Webpack, Vite, Parcel (unless absolutely necessary for TS transpilation).
- **NO Complex Runtime**: Output must be static HTML files.
