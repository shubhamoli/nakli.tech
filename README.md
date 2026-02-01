# nakli.tech

Personal website and blog built with [Sutra](https://github.com/shubhamoli/Sutra) static site generator.

## Project Structure

```
nakli.tech/
├── content/         # Website content (markdown, assets, etc.)
├── sutra/           # Static site generator (git submodule)
├── build/           # Generated static files (gitignored)
└── README.md
```

## Local Setup

### Prerequisites

- Go (for building content)
- Node.js and npm (for frontend)

### First Time Clone

```bash
# Clone the repository with submodules
git clone --recurse-submodules git@github.com:shubhamoli/nakli.tech.git
cd nakli.tech
```

**OR** if you already cloned without `--recurse-submodules`:

```bash
git clone git@github.com:shubhamoli/nakli.tech.git
cd nakli.tech
git submodule init
git submodule update
```

### Install Dependencies

```bash
# Install frontend dependencies
cd sutra/frontend
npm install
cd ../..
```

## Development

### Start Development Server

```bash
# Option 1: Use the helper script (easiest)
./dev.sh

# Option 2: Run directly
cd sutra
CONTENT_DIR=../content ./scripts/dev.sh
```

This will:
1. Build your content from `content/` directory into JSON
2. Start the frontend dev server at http://localhost:3000
3. Watch for changes and rebuild automatically

### Build for Production

```bash
# Build content
cd sutra
CONTENT_DIR=../content ./scripts/build-content.sh

# Build frontend
cd frontend
npm run build
cd ../..
```

The static site will be in `sutra/frontend/build/` - ready to deploy!

## Working with the Sutra Submodule

### Update Sutra to Latest Version

```bash
cd sutra
git pull origin main
cd ..
git add sutra
git commit -m "Update Sutra to latest version"
git push
```

### Pin Sutra to a Specific Version

```bash
cd sutra
git checkout <commit-hash>  # or tag name
cd ..
git add sutra
git commit -m "Pin Sutra to version X.Y.Z"
git push
```

### Check Current Sutra Version

```bash
cd sutra
git log -1  # Shows the current commit
```

## Adding Content

Add your markdown files, images, and other assets to the `content/` directory following this structure:

```
content/
├── posts/          # Blog posts
│   └── 2025/       # Organized by year
│       └── my-post.md
└── notes/          # Notes and documentation
    └── topic/      # Organized by topic
        └── my-note.md
```

### Markdown Format

Each markdown file should have frontmatter:

```markdown
---
title: "Your Post Title"
date: 2025-02-01
tags: [javascript, react]
categories: [programming]
description: "Brief description of your post"
---

Your content here in markdown format...
```

**Required fields:** `title` and `date`

Refer to [Sutra's CONTENT.md](https://github.com/shubhamoli/Sutra/blob/main/CONTENT.md) for detailed formatting guidelines.

## Deployment

*(Add your deployment instructions here)*

## Troubleshooting

**Submodule is empty or missing:**
```bash
git submodule update --init --recursive
```

**Submodule shows uncommitted changes:**
```bash
cd sutra
git status  # Check what changed
git checkout .  # Reset if needed
```
