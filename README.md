# nakli.tech

My personal site and notes, built with [Patra](https://github.com/shubhamoli/Patra). The home page is about me, and the rest is stuff I've written over the years.

## Running it locally

You'll need Node.js 18 or newer.

```bash
npm install
npm run build
npm run serve
```

Then open <http://localhost:8080>.

## Where things are

```text
content/             the notes, the About me page and images
content/About me.md  the home page
content/_redirects   sends old Hugo URLs to the new pages (Cloudflare reads this)
patra.config.json    site name, theme and which note is the home page
public/              the built site (generated, not committed)
```

Everything else (`assets/`, `scripts/`, `template.html` and so on) comes from Patra. To change how the site looks, add `assets/custom.css` instead of editing Patra's files. The [customizing guide](https://github.com/shubhamoli/Patra/blob/main/content/Guides/Customizing.md) has the details.

## Deploying

The site is on Cloudflare Pages with these build settings:

- Build command: `npm ci && npm run build`
- Build output directory: `public`
- Environment variable: `NODE_VERSION` set to `20`

## Updating Patra

This repo started as a clone of Patra, with Patra added as the `upstream` remote. To pull in new versions:

```bash
git pull upstream main
```

The first time, add `--allow-unrelated-histories` (the migration was squashed into one commit, so git doesn't yet know this repo came from Patra). After that, the plain command works. That first pull may also bring back Patra's sample notes in `content/Guides/`, `content/Examples/` and `content/Welcome.md`; just delete them again.

If you don't have the remote yet (for example on a fresh clone):

```bash
git remote add upstream git@github.com:shubhamoli/Patra.git
```

Git may ask you to sort out conflicts in files this repo has its own version of, like `README.md` and `patra.config.json`. Keep this repo's version of those.

## License

Patra's code is MIT licensed (see `LICENSE`). The notes in `content/` are licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
