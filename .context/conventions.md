# Conventions

## Code Style
- **TypeScript**: Strict mode. Explicit types for build logic. Keep runtime dependencies to a minimum.
- **No JS requirement**: The generated site must work with JavaScript disabled. Any script must be an optional enhancement and small enough to inline in `template.html`.
- **CSS**:
  - BEM-ish class names (e.g. `.sidebar__footer`, `.tree__row--file`).
  - Put every rule in the right `@layer` (see `.context/architecture.md`). Never use `!important`.
  - Components use tokens only: `--color-*` for colour, `--space-*`, `--text-*`, `--radius-*`, `--z-*`, `--duration-*` for everything else. No raw hex, px spacing or magic z-indexes in components; add a token instead.
  - New colours go in as primitives first, then a semantic `light-dark()` token. Text colours must meet WCAG AA (4.5:1) on both `--color-bg` and `--color-surface`.
  - Write mobile first; responsive changes should mostly be token overrides in `@media (min-width: 48rem)`.
  - Read the hidden checkboxes only in the `state` layer; components read the custom properties it sets.
  - Reuse utilities (`.visually-hidden`, `.truncate`, `.icon`, `.surface`, `.elevated`) instead of copying their declarations.
  - Style rendered markdown under `.prose` with `:where()` so it stays easy to override.
  - No CDN assets or web fonts; use the system font stack and inline SVG icons with `class="icon"`.
- **HTML**: Semantic tags (`<main>`, `<aside>`, `<nav>`, `<article>`). Interactive bits use native elements (`<details>`, checkbox + `<label>`) so they work without JS.

## File Naming
- **Scripts**: `camelCase.ts` (e.g. `build.ts`, `cli.ts`).
- **Content**: Any filename works, spaces included. The filename is the note's label in the sidebar unless frontmatter sets a `title`.

## Content Format
- **Wiki-links**: `[[Note Name]]` resolves by note name, case-insensitively, regardless of folder, and links to that note's page. Inside markdown tables, write the alias pipe as `\|`.
- **Frontmatter**: Optional YAML at the top of a note. Supported keys: `title`, `date`, `tags` (tags are displayed; there are no tag pages yet).
- **Sample content**: `content/Welcome.md` is a verbatim copy of `README.md`. When one changes, copy it over the other.

## Version Control (Git)
- **Default branch**: `main`. Changes land through pull requests, not direct commits.
- **Feature branches**: Cut from `origin/main`, named `<your-name>/<short-topic>` (e.g. `Oli/add/md/viewer`).
- **Workflow**:
  1. `git fetch origin`
  2. `git checkout main && git rebase origin/main`
  3. `git checkout -b <your-name>/<short-topic>`
  4. Make changes.
  5. **Verify**: `npm run typecheck` and `npm run build` pass, and the site still works with JS disabled.
  6. Commit using Conventional Commits (e.g. `feat: add backlinks`).
  7. Push and open a pull request into `main`.

## Agent Workflow
- **Context maintenance**: Update the relevant `.context/*.md` files when architecture, tech stack or goals change, so they stay the source of truth.
- **Documentation style**: In summaries and PR descriptions, use H2 (`##`) for section titles and dashes (`-`) for list items.
