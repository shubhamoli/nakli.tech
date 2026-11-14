# Linking notes

You can link your notes together using either Obsidian-style links or regular markdown links.

## Obsidian-style links

| What you type | What shows up |
|---|---|
| `[[Writing notes]]` | [[Writing notes]] |
| `[[Writing notes\|this guide]]` | [[Writing notes\|this guide]] |
| `[[Markdown showcase#Tables]]` | [[Markdown showcase#Tables]] |
| `[[A note that doesn't exist]]` | [[A note that doesn't exist]] |

You only need the name of the note, not which folder it's in. Patra will find it, and capitalization doesn't matter. If a note doesn't exist, the link shows up faded so it's easy to spot.

Inside a table you have to write the `|` in a link as `\|`, like in the second row. Obsidian has the same rule.

## Regular markdown links

Normal relative links to `.md` files work too. Patra changes them to point at the right page, like this link to [organizing your notes](../Guides/Organizing%20your%20notes.md).

## Images

You can use `![[picture.png]]` like in Obsidian, or the regular `![alt text](images/picture.png)`. Either way, just put the image somewhere in `content/` and it'll get copied over when you build.
