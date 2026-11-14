# Organizing your notes

There aren't any special rules for this. The sidebar shows your folders exactly the way they are on your computer, so organize them however makes sense to you.

## Some things to know

- Folders are listed first, then notes, both in alphabetical order. Numbers sort the way you'd expect, so `2 Second` comes before `10 Tenth`.
- You can nest folders as deep as you want. When you open a note, the folder it's in opens up in the sidebar.
- Anything that starts with a dot gets ignored, so folders like `.obsidian/` and `.trash/` won't show up on your site.
- Files that aren't markdown (images, PDFs and so on) get copied over without any changes.

## Example layout

Here's one way you could set things up:

```text
content/
├── Welcome.md
├── Projects/
│   ├── Patra.md
│   └── Side quests.md
├── Reading/
│   └── Books 2026.md
└── About/
    └── Resume.md
```

If you want people to see your resume first instead of the welcome page, set `"home": "About/Resume.md"` in `patra.config.json` and rebuild.

Go back to [[Writing notes]].
