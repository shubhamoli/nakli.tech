# Mission

Patra turns a folder of markdown notes into a fast, read-only static website with an Obsidian-like interface. People clone the repo, drop their notes into `content/`, build, and host the output anywhere.

## Principles
- **Obsidian-like reading**: A clean, distraction-free page with a sidebar that mirrors the folder structure of `content/`.
- **No frameworks**: The site is plain HTML and CSS. The build is a small TypeScript script with a handful of dependencies.
- **Works without JavaScript**: Every feature must work with JS disabled. JS is only allowed as an optional enhancement (today: remembering the theme choice).
- **Lean on purpose**: The web is heavy enough. No CDN assets, web fonts, trackers or client-side rendering.
- **Static and portable**: All links are relative, so the output works on any host, under a sub-path, or opened from disk.
- **Mobile first**: Comfortable to use one-handed; the file explorer opens from a button within thumb reach.
- **Read-only**: No editing, comments or popups.
- **Easy to adopt**: Clone, add notes, build. Distributed via git, not npm.
- **AI-friendly codebase**: `.context/` documents the project so agents can work on it safely.

## Current Features
- Nested sidebar built from `content/`, with the current note's folders opened.
- Obsidian wiki-links (`[[Note]]`, `[[Note|alias]]`, `[[Note#Heading]]`) and image embeds (`![[image.png]]`).
- Relative markdown links to `.md` files rewritten to the built pages.
- Frontmatter `title`, `date` and `tags` shown on the page.
- Light and dark themes (OS default, config override, sidebar toggle).
- Configurable home note (`home` in `patra.config.json`).

## Ideas, Not Built Yet
- Backlinks ("Linked mentions") per note.
- Tag pages.
- Build-time syntax highlighting for code blocks.
- Obsidian callouts (`> [!note]`).
