#!/usr/bin/env node
/**
 * Build script: reads manifest.json from each plugin folder,
 * extracts icon as PNG, fetches GitHub releases (if GITHUB_TOKEN is set),
 * and outputs site/data/plugins.json + site/public/icons/*.png
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// site/scripts/ -> site/ -> repo root
const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const ICONS_DIR = path.resolve(__dirname, '..', 'docs', 'public', 'icons');

const GITHUB_REPO = 'misaka10843/CollapsePlugin-ReleaseRepo';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
const JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@main`;

// Plugin folders to scan (directory name is the plugin id)
const PLUGIN_DIRS = ['Arknights', 'Endfield', 'StellaSora'];

const READMES_DIR = path.resolve(__dirname, '..', 'docs', '_readmes');
// site/plugins/{id}/ — source of README and meta.json (committed, editable without touching manifest)
const PLUGIN_META_DIR = path.resolve(__dirname, '..', 'plugins');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(READMES_DIR, { recursive: true });

async function fetchReleases(pluginId) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'collapse-plugin-site-builder',
    Accept: 'application/vnd.github+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.log(`[build-data] GITHUB_TOKEN not set, using unauthenticated API (60 req/h)`);
  }
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[build-data] GitHub API error ${res.status} for ${pluginId}`);
      return [];
    }
    const releases = await res.json();
    // Filter releases that have tags starting with pluginId (e.g. Arknights-v1.0.0)
    return releases
      .filter((r) => r.tag_name.startsWith(pluginId + '-') || r.tag_name.startsWith(pluginId + '/'))
      .map((r) => ({
        version: r.tag_name,
        name: r.name || r.tag_name,
        date: r.published_at,
        body: r.body || '',
        url: r.html_url,
      }));
  } catch (e) {
    console.warn(`[build-data] Failed to fetch releases: ${e.message}`);
    return [];
  }
}

function readManifest(pluginId) {
  const manifestPath = path.join(ROOT, pluginId, 'manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

function extractIcon(pluginId, iconBase64) {
  if (!iconBase64) return null;
  // The icon is a base64-encoded PNG (starting with iVBOR = PNG header)
  try {
    const buf = Buffer.from(iconBase64, 'base64');
    const iconFile = path.join(ICONS_DIR, `${pluginId}.png`);
    fs.writeFileSync(iconFile, buf);
    return `/icons/${pluginId}.png`;
  } catch (e) {
    console.warn(`[build-data] Failed to extract icon for ${pluginId}: ${e.message}`);
    return null;
  }
}

function readPluginMeta(pluginId) {
  const metaPath = path.join(PLUGIN_META_DIR, pluginId, 'meta.json');
  if (!fs.existsSync(metaPath)) return {};
  try { return JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch { return {}; }
}

/**
 * Find the latest zip in build/ by parsing the version from the filename.
 * Filename format: {PluginId}_{version}_API-{apiVersion}_{date}.zip
 * Sort by version segments descending.
 */
function findLatestZip(pluginId) {
  const buildDir = path.join(ROOT, pluginId, 'build');
  if (!fs.existsSync(buildDir)) return null;
  const zips = fs.readdirSync(buildDir).filter((f) => f.endsWith('.zip'));
  if (zips.length === 0) return null;

  const parsed = zips.map((filename) => {
    // e.g. Arknights_1.0.2.0_API-0.1.5.0_20260422.zip
    const match = filename.match(/^[^_]+_([\d.]+)_API-([\d.]+)_(\d+)\.zip$/);
    return {
      filename,
      version: match ? match[1] : '0',
      date: match ? parseInt(match[3], 10) : 0,
    };
  });

  // Sort: higher version wins; tie-break by date
  parsed.sort((a, b) => {
    const av = a.version.split('.').map(Number);
    const bv = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(av.length, bv.length); i++) {
      const diff = (bv[i] || 0) - (av[i] || 0);
      if (diff !== 0) return diff;
    }
    return b.date - a.date;
  });

  const best = parsed[0];
  const stat = fs.statSync(path.join(buildDir, best.filename));
  const encodedPath = `build/${best.filename}`;
  return {
    filename: best.filename,
    version: best.version,
    size: stat.size,
    githubRaw: `${GITHUB_RAW_BASE}/${pluginId}/${encodedPath}`,
    jsdelivr: `${JSDELIVR_BASE}/${pluginId}/${encodedPath}`,
  };
}

function listAssets(pluginId) {
  // All files except build/ directory — these are hosted on this site
  const pluginDir = path.join(ROOT, pluginId);
  const files = [];
  function walk(dir, base) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relBase = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (entry.name === 'build') continue; // build/ not hosted on site
        walk(path.join(dir, entry.name), relBase);
      } else {
        const stat = fs.statSync(path.join(dir, entry.name));
        // Skip README and manifest (docs, not binary assets)
        if (/^README/i.test(entry.name) || entry.name === 'manifest.json') continue;
        files.push({
          path: relBase,
          size: stat.size,
          siteRelative: `/${pluginId}/${relBase}`,
          githubRaw: `${GITHUB_RAW_BASE}/${pluginId}/${relBase}`,
          jsdelivr: `${JSDELIVR_BASE}/${pluginId}/${relBase}`,
        });
      }
    }
  }
  walk(pluginDir, '');
  return files;
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']);
const PUBLIC_ASSETS_DIR = path.resolve(__dirname, '..', 'docs', 'public', 'plugin-assets');

function rewriteAndCopyImages(markdown, pluginId) {
  const assetBase = `/plugin-assets/${pluginId}`;
  const srcBase = path.join(ROOT, pluginId);
  const dstBase = path.join(PUBLIC_ASSETS_DIR, pluginId);

  return markdown.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/|\/\/|#)([^)\s]+)(\s+["'][^"']*["'])?\)/g,
    (match, alt, imgSrc, title = '') => {
      const clean = imgSrc.replace(/^\.\//, '');
      const ext = path.extname(clean).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) return match; // leave non-image relative links untouched
      const srcFile = path.join(srcBase, clean);
      if (fs.existsSync(srcFile)) {
        const dstFile = path.join(dstBase, clean);
        fs.mkdirSync(path.dirname(dstFile), { recursive: true });
        fs.copyFileSync(srcFile, dstFile);
      }
      return `![${alt}](${assetBase}/${clean}${title})`;
    }
  );
}

function copyReadmes(pluginId) {
  const id = pluginId.toLowerCase();
  const metaDir = path.join(PLUGIN_META_DIR, pluginId);
  const src = (lang) => lang === 'en'
    ? path.join(metaDir, 'README.md')
    : path.join(metaDir, 'README.zh-CN.md');
  const dst = (lang) => path.join(READMES_DIR, `${id}-${lang}.md`);
  for (const lang of ['en', 'zh']) {
    // zh falls back to en if zh-CN file missing
    const srcFile = fs.existsSync(src(lang)) ? src(lang)
      : lang === 'zh' && fs.existsSync(src('en')) ? src('en')
      : null;
    if (srcFile) {
      const content = rewriteAndCopyImages(fs.readFileSync(srcFile, 'utf-8'), pluginId);
      fs.writeFileSync(dst(lang), content, 'utf-8');
    } else {
      fs.writeFileSync(dst(lang), `# ${pluginId}\n\nNo documentation available.\n`);
    }
  }
}

async function main() {
  const plugins = [];

  for (const pluginId of PLUGIN_DIRS) {
    const pluginPath = path.join(ROOT, pluginId);
    if (!fs.existsSync(pluginPath)) {
      console.warn(`[build-data] Plugin dir not found: ${pluginId}`);
      continue;
    }
    console.log(`[build-data] Processing ${pluginId}...`);

    let manifest;
    try {
      manifest = readManifest(pluginId);
    } catch (e) {
      console.error(`[build-data] Failed to read manifest for ${pluginId}: ${e.message}`);
      continue;
    }

    const meta = readPluginMeta(pluginId);
    copyReadmes(pluginId);
    const iconPath = extractIcon(pluginId, manifest.PluginAlternativeIcon);
    const releases = await fetchReleases(pluginId);
    const assets = listAssets(pluginId);
    const latestZip = findLatestZip(pluginId);

    if (latestZip) {
      console.log(`[build-data]   Latest zip: ${latestZip.filename}`);
    }

    plugins.push({
      id: pluginId,
      name: manifest.MainPluginName,
      author: manifest.MainPluginAuthor,
      description: manifest.MainPluginDescription,
      version: manifest.PluginVersion,
      standardVersion: manifest.PluginStandardVersion,
      createdAt: manifest.PluginCreationDate,
      updatedAt: manifest.ManifestDate,
      icon: iconPath,
      mainLibrary: manifest.MainLibraryName,
      latestZip,
      assets,
      releases,
      announcement: meta.announcement || null,
    });
  }

  const outputPath = path.join(DATA_DIR, 'plugins.json');
  fs.writeFileSync(outputPath, JSON.stringify(plugins, null, 2), 'utf-8');
  console.log(`[build-data] Written ${plugins.length} plugins to ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
