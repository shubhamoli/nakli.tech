#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { generateSite, SiteConfig } from './build';

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'Patra',
  contentDir: './content',
  outputDir: './public',
  theme: 'auto',
  home: 'Welcome.md',
};

function loadConfig(): SiteConfig {
  const configPath = path.resolve(process.cwd(), 'patra.config.json');
  if (!fs.existsSync(configPath)) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
  } catch {
    console.error('Could not parse patra.config.json, using defaults.');
    return DEFAULT_CONFIG;
  }
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

/** Minimal static file server for previewing the generated site. */
function serve(root: string, port: number): void {
  const rootDir = path.resolve(root);
  http
    .createServer((req, res) => {
      let urlPath: string;
      try {
        urlPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
      } catch {
        res.writeHead(400).end('Bad request');
        return;
      }
      let filePath = path.join(rootDir, urlPath);
      if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
          return;
        }
        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type }).end(data);
      });
    })
    .listen(port, () => console.log(`Serving ${rootDir} at http://localhost:${port}`));
}

const program = new Command();

program
  .name('patra')
  .description('Turn a folder of markdown notes into a static, JS-free note viewer.')
  .version('0.1.0');

program
  .command('build')
  .description('Build the static site')
  .action(async () => {
    await generateSite(loadConfig());
  });

program
  .command('init')
  .description('Create patra.config.json and a sample content/ directory')
  .action(() => {
    const root = process.cwd();
    const configPath = path.join(root, 'patra.config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, `${JSON.stringify({ siteName: 'Patra', theme: 'auto', home: 'Welcome.md' }, null, 2)}\n`);
      console.log('Created patra.config.json');
    }
    const contentDir = path.join(root, 'content');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir);
      fs.writeFileSync(path.join(contentDir, 'Welcome.md'), '# Welcome\n\nThis is your home page. Point `home` in patra.config.json at any note to change it.\n');
      console.log('Created content/ with a sample Welcome.md');
    } else {
      console.log('content/ already exists, leaving it as is.');
    }
    console.log('Run "patra build" to generate your site.');
  });

program
  .command('serve')
  .description('Preview the generated site locally')
  .option('-p, --port <number>', 'port to serve on', '8080')
  .action((options: { port: string }) => {
    serve(loadConfig().outputDir, Number(options.port));
  });

program.parse(process.argv);
