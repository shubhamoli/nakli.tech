---
title: Writing notes
date: 2026-11-14
tags: [guide, basics]
---

To add a note, make a `.md` file somewhere inside `content/` and rebuild. That's really all there is to it.

## Adding a note

1. Create a file, for example `content/Ideas/Weekend project.md`.
2. Write whatever you want in it.
3. Run `npm run build`.

After that you'll see an `Ideas` folder in the sidebar with your note in it.

## Titles

By default the sidebar uses the filename. If you want something different, add a `title` to the frontmatter at the top of the note, like I did with this one. You can add a `date` and `tags` the same way, and they'll show up under the title.

If your note already starts with a `# Heading`, Patra uses that as the page heading so you don't end up with two.

## Other notes to read

- [[Markdown showcase]] has examples of everything markdown can do.
- [[Linking notes]] explains how to link notes to each other.
- [[Organizing your notes]] has some tips on folders.
- [[Customizing]] shows how to change the colors, fonts and layout.
