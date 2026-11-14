# Architecture

## Static Site Generation (SSG) Pipeline

The build process involves two distinct passes to handle the graph nature of the content.

All logic lives in `scripts/build.ts` (`generateSite`).

### 1. Scan Phase
- **Input**: Every non-hidden file in `content/` (dotfiles/dirs like `.obsidian/` are skipped).
- **Parse**: `*.md` → frontmatter via `gray-matter`; title = frontmatter `title` or filename.
- **Index**: Case-insensitive lookup maps by path and by basename, for pages and for other files (Obsidian-style resolution).
- **Home note**: `home` in `patra.config.json` (default `Welcome.md`, then `index.md`) is rendered as `public/index.html` and still listed in the tree at its normal spot; links to it point at `index.html`. With no home note, a generated page is used.
- **Tree**: Nested folder tree for the sidebar (folders first, then notes, natural sort).

### 2. Render Phase
- **Markdown**: `marked` (GFM) with:
  - a `wikilink` inline extension: `[[Note]]`, `[[Note|alias]]`, `[[Note#Heading]]`, `![[image.png]]`; unresolved links render as muted text. Code spans/blocks are untouched.
  - `walkTokens` rewriting relative/absolute links so `.md` → `.html` and every URL is relative to the current page. A `.md` link whose exact path doesn't exist falls back to a note with the same filename (this is how README.md's links also work from its copy, `content/Welcome.md`).
  - heading `id`s (slugified, de-duplicated per page) for anchors.
- **Template**: `template.html` with `{{placeholders}}` filled in one regex pass (`theme`, `title`, `siteName`, `year`, `home`, `css`, `customCss`, `sidebar`, `breadcrumb`, `header`, `content`, `stats`).
- **Output**: `public/` mirrors `content/` with original filenames (`Guides/Writing notes.html`); non-markdown files are copied verbatim; engine CSS goes to `public/_patra/`. All links are relative, so the site works from any sub-path or straight from `file://`.

## Styling (`assets/style.css`)
- **Layers**: `reset, tokens, state, base, layout, components, prose, utilities`. Unlayered CSS (`custom.css`) beats all of them.
- **Tokens**: primitives (`--brand-light/dark`, `--gray-*`) → semantic (`--color-*`, `--text-*`, `--space-*`, `--radius-*`, `--z-*`, `--duration-*`) → component (`--sidebar-width`, `--measure`, `--tree-row-height`...). Tints are derived with `color-mix()` from `--color-accent`/`--color-text`. Breakpoint values are token overrides inside `@media (min-width: 48rem)`.
- **State**: the hidden `#sidebar-toggle` and `#theme-toggle` checkboxes are read only in the `state` layer via `:root:has(...)`, which sets custom properties (`--drawer-offset`, `--sidebar-column`, ...) and `color-scheme`. Markup can move without breaking layout.
- **Components** use BEM-ish classes; generated markup lives in `build.ts` (tree, breadcrumb, wiki-links with `data-unresolved`).
- **Prose**: `.prose` wraps rendered markdown. Vertical rhythm is one variable, `--flow-space`, applied with `* + *`; headings, lists and rules override it.
- **Utilities**: `.visually-hidden`, `.truncate`, `.icon`, `.surface`, `.elevated`.

## Directory Structure
- `assets/`: Core CSS (`style.css`). Users may add `custom.css` for overrides; a project's own `assets/style.css` is ignored with a warning so it can't replace the core.
- `content/`: Source markdown files. Tracked, with sample notes; users replace them with their own.
- `public/`: (Generated, gitignored) Static site output.
- `scripts/`: Build logic (e.g., `build.ts`).
- `.context/`: AI-specific documentation and context.
- `template.html`: Base layout used for all pages.
- `patra.config.json`: Site settings (`siteName`, `theme`, `home`, `contentDir`, `outputDir`).
