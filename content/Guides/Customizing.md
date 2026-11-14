---
title: Customizing
tags: [guide]
---

You can change pretty much everything about how your site looks, and you don't have to touch Patra's own files to do it.

## Use custom.css

The easiest way is to create a file called `assets/custom.css`. Patra loads it after its own styles, and anything you put in it wins, so you don't have to fight the existing CSS. Patra itself never ships a `custom.css`, so pulling in updates later won't cause conflicts there.

## Change the variables

A lot can be changed just by setting a few variables. For example, this changes the accent color and makes notes a bit wider:

```css
:root {
  --brand-light: #d83a52; /* accent color in light mode */
  --brand-dark: #f06478;  /* accent color in dark mode */
  --measure: 52rem;       /* max width of a note */
}
```

Here are the ones you'll most likely want:

| Variable | What it changes |
|---|---|
| `--brand-light`, `--brand-dark` | The accent color in light and dark mode. Links, tags, quotes and focus rings all follow it. |
| `--font-sans`, `--font-prose`, `--font-mono` | The fonts for the interface, your notes and code |
| `--measure` | How wide a note can get |
| `--sidebar-width` | How wide the sidebar is on bigger screens |
| `--color-bg`, `--color-surface`, `--color-text` and the other `--color-*` ones | Exact colors, if you want full control. Use `light-dark(light, dark)` to set both themes at once. |

All of them are listed at the top of `assets/style.css`.

## Write your own CSS rules

You can also write regular CSS rules in `custom.css`, like `.prose h2 { color: tomato; }`, and they'll win too. Your notes are inside an element with the class `prose`, so that's a good place to start.

## Going further

The page layout is in `template.html` (things like `{{title}}` and `{{content}}` get filled in when the site builds). If you want to change how the pages get made, look at `scripts/build.ts`. Just keep in mind that if you edit these files and Patra changes them later, git will ask you to sort out the conflicts when you pull updates.

Back to [[Writing notes]].
