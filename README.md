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
