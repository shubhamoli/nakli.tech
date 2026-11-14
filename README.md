# Patra

Patra [pa.t̪ra] means Paper in Sanskrit. It is a light weight blogging/notes viewer which displays the markdown content.

As a longtime Obsidian fanboy, I love how simple it is and how clean it looks. I wanted an easy way to put my notes online with that same feel, without setting up a whole blogging platform.

> Patra doesn't use any JavaScript framework, and your site doesn't need JavaScript turned on to work. You can disable it in your browser and everything still works, including the sidebar, the folders and the menu on your phone. Modern websites are bloated and so is the tech used in them. Patra keeps it lean without compromising any experience.

## What it does

- Shows your folders and notes in a sidebar, nested the same way they are in `content/`
- Understands Obsidian-style links like `[[Some Note]]`, `[[Some Note|custom text]]` and `[[Some Note#A Heading]]`, plus image embeds like `![[picture.png]]`
- Has light and dark mode. It goes with whatever your computer is set to, and there's a button at the bottom of the sidebar if you want to switch.
- Works on phones. Tap the Files button in the bottom corner and the sidebar slides in.
- Builds plain HTML files, so you can host them pretty much anywhere, even in a subfolder or opened right off your hard drive.

What it doesn't do: comments, editing, popups or tracking. It's meant for reading and nothing else.

## Getting started

You'll need Node.js 18 or newer, and git.

Clone the repo. You can name the folder whatever you want:

```bash
git clone https://github.com/shubhamoli/Patra.git my-notes
cd my-notes
```

Install the dependencies:

```bash
npm install
```

Build the site and start a local server:

```bash
npm run build
npm run serve
```

Now open <http://localhost:8080>. What you're looking at are the sample notes in `content/`.

When you're ready to use your own notes, delete the samples, copy your markdown files into `content/`, and change `siteName` in `patra.config.json`. Run `npm run build` again any time you change something.

## Writing notes

Every `.md` file in `content/` turns into a page, and every folder shows up in the sidebar. Images, PDFs and other files get copied over too, so regular markdown links to them still work. Anything that starts with a dot (like `.obsidian/`) gets skipped, so you can drop in an Obsidian vault as it is.

You can put frontmatter at the top of a note if you want to, but you don't have to:

```yaml
---
title: A nicer title than the filename
date: 2026-11-14
tags: [ideas, drafts]
---
```

If there's a `title`, it's used instead of the filename in the sidebar and at the top of the page. `date` and `tags` show up under the title.

To link between notes you can use Obsidian-style links (`[[Note]]`) or normal markdown links (`[text](../Folder/Note.md)`). Either one works.

## Settings

All the settings are in `patra.config.json`:

```json
{
  "siteName": "Patra",
  "theme": "auto",
  "home": "Welcome.md"
}
```

| Setting | What it's for | Default |
|---|---|---|
| `siteName` | The name at the top of the sidebar, in the browser tab and in the copyright line | `"Patra"` |
| `theme` | `"auto"` matches the visitor's computer, or set it to `"light"` or `"dark"` | `"auto"` |
| `home` | The note people see first, relative to `content/` (like `"About/Resume.md"`) | `"Welcome.md"` |
| `contentDir` | The folder your notes are in | `"./content"` |
| `outputDir` | The folder the finished site goes into | `"./public"` |

## Changing how it looks

You can change the colors, fonts and layout by adding a file called `assets/custom.css`, without touching Patra's own files. The [customizing guide](content/Guides/Customizing.md) walks through it and lists the variables you can change.

## Putting it online

Run `npm run build` and upload the `public/` folder to wherever you host things. GitHub Pages, Netlify, Cloudflare Pages, S3 or your own server all work fine. If your host builds the site for you, use these settings:

- Build command: `npm ci && npm run build`
- Output directory: `public`

## Getting updates

If I push changes to Patra and you want them, add this repo as a remote and pull:

```bash
git remote add upstream https://github.com/shubhamoli/Patra.git
git pull upstream main
```

If you kept your style changes in `custom.css`, this should go smoothly. If you edited `style.css` or `template.html` directly and I changed them too, git will ask you to fix the conflicts by hand.

## What's in here

```text
content/             your notes (starts out with some samples)
assets/style.css     the styling
assets/custom.css    your style changes (optional, you create it)
template.html        the page layout
scripts/build.ts     the code that turns content/ into public/
scripts/cli.ts       the build, serve and init commands
patra.config.json    your settings
public/              the finished site (gets generated, not committed)
```

## License

MIT, so feel free to use it, change it, or build on it.
