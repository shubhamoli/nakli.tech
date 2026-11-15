import fs from 'fs';
import path from 'path';
import { Marked, Tokens } from 'marked';
import { glob } from 'glob';
import matter from 'gray-matter';

export interface SiteConfig {
  siteName: string;
  contentDir: string;
  outputDir: string;
  /** Project-level asset overrides (e.g. a custom style.css). */
  assetsDir?: string;
  /** Project-level template override. */
  templatePath?: string;
  /** 'auto' follows the OS setting; 'light' / 'dark' force a theme. */
  theme?: 'auto' | 'light' | 'dark';
  /**
   * Note shown when the site is opened, relative to contentDir (e.g. "Welcome.md",
   * "Me/Resume.md"). Defaults to Welcome.md, then index.md, then a generated page.
   */
  home?: string;
}

/** A markdown note. All paths are POSIX, relative to the content root. */
interface Page {
  src: string; // e.g. "Guides/Writing notes.md"
  out: string; // e.g. "Guides/Writing notes.html"
  title: string;
  data: Record<string, unknown>;
  body: string;
}

interface TreeFolder {
  name: string;
  path: string;
  folders: Map<string, TreeFolder>;
  pages: Page[];
}

const ENGINE_DIR = '_patra';
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;

// ---------------------------------------------------------------- helpers

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toPosix = (p: string): string => p.split(path.sep).join('/');

const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const byName = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** Relative, percent-encoded URL from one output file to another. */
function relUrl(fromOut: string, toOut: string): string {
  const rel = path.posix.relative(path.posix.dirname(fromOut), toOut) || path.posix.basename(toOut);
  return rel
    .split('/')
    .map((seg) => (seg === '..' || seg === '.' ? seg : encodeURIComponent(seg)))
    .join('/');
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-') || 'section'
  );
}

function resolveEngineRoot(): string {
  // dev: scripts/ -> one level up; compiled: dist/scripts/ -> two levels up
  let root = path.join(__dirname, '..');
  if (!fs.existsSync(path.join(root, 'template.html'))) root = path.join(root, '..');
  return root;
}

// ---------------------------------------------------------------- generator

export async function generateSite(config: SiteConfig): Promise<void> {
  const projectRoot = process.cwd();
  const engineRoot = resolveEngineRoot();
  const contentDir = path.resolve(projectRoot, config.contentDir);
  const outputDir = path.resolve(projectRoot, config.outputDir);

  if (!fs.existsSync(contentDir)) {
    console.error(`Error: content directory not found at ${contentDir}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Building "${config.siteName}" from ${contentDir}`);

  const userTemplate = path.resolve(projectRoot, config.templatePath || 'template.html');
  const template = fs.readFileSync(
    fs.existsSync(userTemplate) ? userTemplate : path.join(engineRoot, 'template.html'),
    'utf-8',
  );

  // Hidden files/folders (.obsidian, .trash, .DS_Store) are skipped by default.
  const allFiles = (await glob('**/*', { cwd: contentDir, nodir: true })).map(toPosix).sort(byName);
  const mdFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.md'));
  const otherFiles = allFiles.filter((f) => !f.toLowerCase().endsWith('.md'));

  // ---- load pages
  const pages: Page[] = mdFiles.map((src) => {
    const { data, content } = matter(fs.readFileSync(path.join(contentDir, src), 'utf-8'));
    const fileTitle = path.posix.basename(src).replace(/\.md$/i, '');
    return {
      src,
      out: src.replace(/\.md$/i, '.html'),
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : fileTitle,
      data,
      body: content,
    };
  });

  // ---- home note: rendered as the site's index.html (and still listed in the tree)
  const homeKey = (config.home ?? '').trim().replace(/^\.?\/+/, '').toLowerCase();
  const homePage = homeKey
    ? pages.find((p) => [homeKey, `${homeKey}.md`].includes(p.src.toLowerCase()))
    : (pages.find((p) => p.src.toLowerCase() === 'welcome.md') ?? pages.find((p) => p.src.toLowerCase() === 'index.md'));
  if (homeKey && !homePage) {
    console.warn(`Warning: home note "${config.home}" not found in ${contentDir}; using a generated home page.`);
  }
  for (const p of pages) {
    // A root index.md that is not the home note must not overwrite index.html.
    if (p !== homePage && p.out.toLowerCase() === 'index.html') p.out = 'index-page.html';
  }
  if (homePage) homePage.out = 'index.html';

  // ---- lookup tables for link resolution (case-insensitive, like Obsidian)
  const pageByPath = new Map<string, Page>(); // "guides/writing notes"
  const pageByBase = new Map<string, Page>(); // "writing notes"
  for (const p of pages) {
    const key = p.src.replace(/\.md$/i, '').toLowerCase();
    pageByPath.set(key, p);
    const base = path.posix.basename(key);
    if (!pageByBase.has(base)) pageByBase.set(base, p);
  }
  const fileByPath = new Map<string, string>();
  const fileByBase = new Map<string, string>();
  for (const f of otherFiles) {
    fileByPath.set(f.toLowerCase(), f);
    const base = path.posix.basename(f).toLowerCase();
    if (!fileByBase.has(base)) fileByBase.set(base, f);
  }

  const findPage = (target: string): Page | undefined => {
    const key = target.replace(/\.md$/i, '').replace(/^\/+/, '').toLowerCase();
    return pageByPath.get(key) ?? pageByBase.get(path.posix.basename(key));
  };
  const findFile = (target: string): string | undefined => {
    const key = target.replace(/^\/+/, '').toLowerCase();
    return fileByPath.get(key) ?? fileByBase.get(path.posix.basename(key));
  };

  // ---- markdown renderer (one instance; `current` is the page being rendered)
  let current: Page = pages[0];
  let headingSlugs = new Map<string, number>();

  /** Rewrite relative markdown links/images so they work from the output page. */
  const rewriteHref = (href: string): string => {
    if (!href || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(href)) {
      return href;
    }
    const hashAt = href.indexOf('#');
    const rawPath = hashAt === -1 ? href : href.slice(0, hashAt);
    const hash = hashAt === -1 ? '' : href.slice(hashAt);
    const decoded = safeDecode(rawPath);
    const target = decoded.startsWith('/')
      ? path.posix.normalize(decoded.slice(1))
      : path.posix.normalize(path.posix.join(path.posix.dirname(current.src), decoded));

    if (/\.md$/i.test(target)) {
      // Exact path first; otherwise match by filename, like wiki-links. This lets one link
      // work from different folders (e.g. README.md in the repo root and its copy, content/Welcome.md).
      const page = pageByPath.get(target.replace(/\.md$/i, '').toLowerCase()) ?? findPage(target);
      return relUrl(current.out, page ? page.out : target.replace(/\.md$/i, '.html')) + hash;
    }
    return relUrl(current.out, target) + hash;
  };

  const marked = new Marked({ gfm: true });
  marked.use({
    walkTokens(token) {
      if (token.type === 'link' || token.type === 'image') {
        token.href = rewriteHref(token.href);
      }
    },
    renderer: {
      heading(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        let id = slugify(token.text);
        const seen = headingSlugs.get(id) ?? 0;
        headingSlugs.set(id, seen + 1);
        if (seen) id = `${id}-${seen}`;
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
    },
    extensions: [
      {
        // Obsidian wiki links: [[Note]], [[Note|alias]], [[Note#Heading]], ![[image.png]]
        name: 'wikilink',
        level: 'inline',
        start: (src: string) => src.match(/!?\[\[/)?.index,
        tokenizer(src: string) {
          const m = /^(!?)\[\[([^[\]\n]+?)\]\]/.exec(src);
          if (!m) return undefined;
          return { type: 'wikilink', raw: m[0], embed: m[1] === '!', target: m[2] };
        },
        renderer(token: Tokens.Generic) {
          const [ref, alias] = String(token.target).split('|');
          const [name, heading] = ref.split('#');
          const label = escapeHtml((alias ?? (heading && !name ? heading : name || ref)).trim());

          if (token.embed && IMAGE_EXT.test(name.trim())) {
            const file = findFile(name.trim());
            if (file) {
              const size = alias && /^\d+(x\d+)?$/.test(alias.trim()) ? alias.trim().split('x') : null;
              const dims = size ? ` width="${size[0]}"${size[1] ? ` height="${size[1]}"` : ''}` : '';
              return `<img src="${relUrl(current.out, file)}" alt="${escapeHtml(path.posix.basename(file))}"${dims} loading="lazy">`;
            }
          }

          const anchor = heading ? `#${slugify(heading)}` : '';
          if (!name.trim()) return `<a class="wikilink" href="${anchor}">${label}</a>`;

          const page = findPage(name.trim());
          if (page) {
            return `<a class="wikilink" href="${relUrl(current.out, page.out)}${anchor}">${label}</a>`;
          }
          const file = findFile(name.trim());
          if (file) return `<a class="wikilink" href="${relUrl(current.out, file)}">${label}</a>`;
          return `<span class="wikilink" data-unresolved title="Note not found">${label}</span>`;
        },
      },
    ],
  });

  // ---- folder tree
  const tree: TreeFolder = { name: '', path: '', folders: new Map(), pages: [] };
  for (const p of pages) {
    const parts = p.src.split('/');
    let node = tree;
    parts.slice(0, -1).forEach((part, i) => {
      if (!node.folders.has(part)) {
        node.folders.set(part, {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          folders: new Map(),
          pages: [],
        });
      }
      node = node.folders.get(part)!;
    });
    node.pages.push(p);
  }

  const renderTree = (folder: TreeFolder, active: Page | null): string => {
    const folders = [...folder.folders.values()].sort((a, b) => byName(a.name, b.name));
    const files = [...folder.pages].sort((a, b) => byName(a.title, b.title));
    const from = active ? active.out : 'index.html';
    let html = '<ul class="tree__list">';
    for (const f of folders) {
      const open = active && active.src.startsWith(`${f.path}/`) ? ' open' : '';
      html +=
        `<li class="tree__item"><details class="tree__folder"${open}>` +
        `<summary class="tree__row tree__row--folder"><span class="tree__label truncate">${escapeHtml(f.name)}</span></summary>` +
        `${renderTree(f, active)}</details></li>`;
    }
    for (const p of files) {
      const ariaCurrent = active === p ? ' aria-current="page"' : '';
      html +=
        `<li class="tree__item"><a class="tree__row tree__row--file" href="${relUrl(from, p.out)}"${ariaCurrent}>` +
        `<span class="tree__label truncate">${escapeHtml(p.title)}</span></a></li>`;
    }
    return `${html}</ul>`;
  };

  const renderBreadcrumb = (page: Page | null): string => {
    if (!page) {
      return `<span class="breadcrumb__current truncate">${escapeHtml(config.siteName)}</span>`;
    }
    const folders = page.src.split('/').slice(0, -1);
    return [
      ...folders.map((f) => `<span class="breadcrumb__item truncate">${escapeHtml(f)}</span>`),
      `<span class="breadcrumb__current truncate" aria-current="page">${escapeHtml(page.title)}</span>`,
    ].join('<span class="breadcrumb__sep" aria-hidden="true">/</span>');
  };

  const renderHeader = (page: Page): string => {
    // Skip the inline title if the note already opens with its own H1.
    const hasOwnH1 = /^\s*#\s+\S/.test(page.body);
    const meta: string[] = [];
    const date = page.data.date;
    if (date instanceof Date || typeof date === 'string') {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        meta.push(`<time datetime="${d.toISOString().slice(0, 10)}">${label}</time>`);
      }
    }
    const tags = Array.isArray(page.data.tags) ? page.data.tags : [];
    const tagsHtml = tags.length
      ? `<ul class="note__tags">${tags.map((t) => `<li class="tag">#${escapeHtml(String(t))}</li>`).join('')}</ul>`
      : '';
    if (hasOwnH1 && !meta.length && !tagsHtml) return '';
    return (
      '<header class="note__header">' +
      (hasOwnH1 ? '' : `<h1 class="note__title">${escapeHtml(page.title)}</h1>`) +
      (meta.length ? `<p class="note__meta">${meta.join('')}</p>` : '') +
      tagsHtml +
      '</header>'
    );
  };

  // Single regex pass, so placeholder-like text inside notes is never re-expanded.
  const fill = (vars: Record<string, string>): string =>
    template.replace(/\{\{(\w+)\}\}/g, (whole, key: string) => (key in vars ? vars[key] : whole));

  const theme = config.theme === 'light' || config.theme === 'dark' ? config.theme : 'auto';

  // ---- assets: core style.css from the engine, plus an optional custom.css for overrides.
  // A project's own assets are copied too, but never replace the core style.css: overrides
  // belong in custom.css, which loads after it and wins (it isn't in a cascade layer).
  const engineAssets = path.join(engineRoot, 'assets');
  const userAssets = path.resolve(projectRoot, config.assetsDir || 'assets');
  const hasUserAssets = fs.existsSync(userAssets) && path.resolve(userAssets) !== path.resolve(engineAssets);
  const hasCustomCss =
    fs.existsSync(path.join(engineAssets, 'custom.css')) ||
    (hasUserAssets && fs.existsSync(path.join(userAssets, 'custom.css')));

  const renderPage = (page: Page | null, out: string, bodyHtml: string, header: string, stats: string): string =>
    fill({
      theme,
      title: escapeHtml(page && page !== homePage ? `${page.title} · ${config.siteName}` : config.siteName),
      siteName: escapeHtml(config.siteName),
      year: String(new Date().getFullYear()),
      home: relUrl(out, 'index.html'),
      css: relUrl(out, `${ENGINE_DIR}/style.css`),
      customCss: hasCustomCss ? `<link rel="stylesheet" href="${relUrl(out, `${ENGINE_DIR}/custom.css`)}">` : '',
      sidebar: renderTree(tree, page),
      breadcrumb: renderBreadcrumb(page),
      header,
      content: bodyHtml,
      stats,
    });

  // ---- write output
  fs.mkdirSync(outputDir, { recursive: true });

  fs.cpSync(engineAssets, path.join(outputDir, ENGINE_DIR), { recursive: true });
  if (hasUserAssets) {
    const userStyle = path.join(userAssets, 'style.css');
    fs.cpSync(userAssets, path.join(outputDir, ENGINE_DIR), {
      recursive: true,
      filter: (src) => path.resolve(src) !== userStyle,
    });
    if (fs.existsSync(userStyle)) {
      console.warn(`Warning: ignoring ${userStyle}; put style overrides in custom.css instead.`);
    }
  }

  for (const f of otherFiles) {
    const dest = path.join(outputDir, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(contentDir, f), dest);
  }

  for (const page of pages) {
    current = page;
    headingSlugs = new Map();
    const bodyHtml = marked.parse(page.body, { async: false }) as string;
    const words = page.body.split(/\s+/).filter(Boolean).length;
    const stats = `${words.toLocaleString('en')} words · ${page.body.trim().length.toLocaleString('en')} characters`;

    const dest = path.join(outputDir, page.out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, renderPage(page, page.out, bodyHtml, renderHeader(page), stats));
  }

  if (!homePage) {
    const count = pages.length;
    const home =
      `<p class="empty-state">${count} ${count === 1 ? 'note' : 'notes'}. ` +
      'Pick one from the file explorer.</p>';
    const header = `<header class="note__header"><h1 class="note__title">${escapeHtml(config.siteName)}</h1></header>`;
    fs.writeFileSync(path.join(outputDir, 'index.html'), renderPage(null, 'index.html', home, header, ''));
  }

  console.log(`Done: ${pages.length} notes, ${otherFiles.length} files copied → ${outputDir}`);
}
