#!/usr/bin/env node
/**
 * Build script: reads manifest.json from each plugin folder,
 * extracts icons, fetches upstream READMEs and release notes,
 * and generates the catalog and public downloads.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readRepositoryContent, renderMarkdown } from './github-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// site/scripts/ -> site/ -> repo root
const ROOT = path.resolve(__dirname, '../..');
const GENERATED_DIR = path.resolve(__dirname, '..', '.generated');
const DATA_DIR = path.join(GENERATED_DIR, 'data');
const PUBLIC_DIR = path.join(GENERATED_DIR, 'public');
const STATIC_PUBLIC_DIR = path.resolve(__dirname, '..', 'docs', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

const GITHUB_REPO = 'misaka10843/CollapsePlugin-ReleaseRepo';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
const JSDELIVR_BASE = `https://fastly.jsdelivr.net/gh/${GITHUB_REPO}@main`;

// site/plugins/{id}/ — source of README and meta.json (committed, editable without touching manifest)
const PLUGIN_META_DIR = path.resolve(__dirname, '..', 'plugins');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
fs.cpSync(STATIC_PUBLIC_DIR, PUBLIC_DIR, { recursive: true });
fs.mkdirSync(ICONS_DIR, { recursive: true });

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
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
}

function readPackage(pluginId) {
  const buildDir = path.join(ROOT, pluginId, 'build');
  const zips = fs.existsSync(buildDir)
    ? fs.readdirSync(buildDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.zip$/i.test(entry.name))
    : [];
  if (zips.length !== 1) {
    throw new Error(`${pluginId}/build must contain exactly one ZIP. Replace the previous package in the same PR. Found: ${zips.map((zip) => zip.name).join(', ') || 'none'}`);
  }
  const filename = zips[0].name;
  const match = filename.match(/^([^_]+)_(\d+(?:\.\d+)*)_API-\d+(?:\.\d+)*_\d{8}\.zip$/);
  if (match?.[1] !== pluginId) {
    throw new Error(`Invalid package filename: ${pluginId}/build/${filename}`);
  }
  const stat = fs.statSync(path.join(buildDir, filename));
  const encodedPath = `build/${encodeURIComponent(filename)}`;
  return {
    filename,
    version: match[2],
    size: stat.size,
    siteRelative: `/${pluginId}/${encodedPath}`,
    githubRaw: `${GITHUB_RAW_BASE}/${pluginId}/${encodedPath}`,
    jsdelivr: `${JSDELIVR_BASE}/${pluginId}/${encodedPath}`,
  };
}

function publishAssets(pluginId, latestZip) {
  const pluginDir = path.join(ROOT, pluginId);
  const destination = path.join(PUBLIC_DIR, pluginId);
  if (fs.existsSync(destination)) throw new Error(`Plugin ID conflicts with a public asset: ${pluginId}`);
  function copy(relativePath) {
    const output = path.join(destination, relativePath);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(pluginDir, relativePath), output);
  }
  copy(`build/${latestZip.filename}`);

  const files = [];
  function walk(dir, base) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relBase = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (entry.name === 'build') continue; // build/ not hosted on site
        walk(path.join(dir, entry.name), relBase);
      } else if (entry.isFile() && !/\.pdb$/i.test(entry.name)) {
        copy(relBase);
        if (/^README/i.test(entry.name) || entry.name === 'manifest.json') continue;
        const stat = fs.statSync(path.join(dir, entry.name));
        const encodedPath = relBase.split('/').map(encodeURIComponent).join('/');
        files.push({
          path: relBase,
          size: stat.size,
          siteRelative: `/${pluginId}/${encodedPath}`,
          githubRaw: `${GITHUB_RAW_BASE}/${pluginId}/${encodedPath}`,
          jsdelivr: `${JSDELIVR_BASE}/${pluginId}/${encodedPath}`,
        });
      }
    }
  }
  walk(pluginDir, '');
  return files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']);
const PUBLIC_ASSETS_DIR = path.join(PUBLIC_DIR, 'plugin-assets');
fs.mkdirSync(PUBLIC_ASSETS_DIR, { recursive: true });

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
      const relative = path.relative(srcBase, srcFile);
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return match;
      if (!fs.existsSync(srcFile) || !fs.lstatSync(srcFile).isFile()) return match;
      const dstFile = path.join(dstBase, clean);
      fs.mkdirSync(path.dirname(dstFile), { recursive: true });
      fs.copyFileSync(srcFile, dstFile);
      return `![${alt}](${assetBase}/${clean}${title})`;
    }
  );
}

function readLocalReadme(pluginId, filename) {
  const source = path.join(PLUGIN_META_DIR, pluginId, filename);
  if (!fs.existsSync(source)) return '';
  return renderMarkdown(rewriteAndCopyImages(fs.readFileSync(source, 'utf-8'), pluginId));
}

async function main() {
  const plugins = [];
  const manifests = fs.readdirSync(PLUGIN_META_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name: id }) => {
      if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(id)) {
        throw new Error(`Invalid plugin directory name: ${id}`);
      }
      return { id, manifest: readManifest(id), latestZip: readPackage(id), meta: readPluginMeta(id) };
    })
    .sort((a, b) => a.id.localeCompare(b.id, 'en'));
  if (!manifests.length) throw new Error('No plugins registered in site/plugins');
  const upstream = await Promise.all(manifests.map(async (plugin) => ({
    ...plugin,
    ...await readRepositoryContent(plugin.meta),
  })));

  for (const { id: pluginId, manifest, latestZip, meta, readmes, releases, repoUrl, releasesUrl } of upstream) {
    console.log(`[build-data] Processing ${pluginId}...`);

    const iconPath = extractIcon(pluginId, manifest.PluginAlternativeIcon);
    const assets = publishAssets(pluginId, latestZip);

    console.log(`[build-data]   Package: ${latestZip.filename}`);

    const summary = {
      id: pluginId,
      name: manifest.MainPluginName,
      author: manifest.MainPluginAuthor,
      description: manifest.MainPluginDescription,
      version: manifest.PluginVersion,
      standardVersion: manifest.PluginStandardVersion,
      createdAt: manifest.PluginCreationDate,
      updatedAt: manifest.ManifestDate,
      icon: iconPath,
    };
    plugins.push(summary);
    const details = {
      ...summary,
      mainLibrary: manifest.MainLibraryName,
      latestZip,
      assets,
      releases,
      readmes: {
        en: readmes.en || readLocalReadme(pluginId, 'README.md'),
        zh: readmes.zh || readLocalReadme(pluginId, 'README.zh-CN.md'),
      },
      repoUrl,
      releasesUrl,
      announcement: meta.announcement || null,
    };
    fs.writeFileSync(path.join(DATA_DIR, `${pluginId.toLowerCase()}.json`), JSON.stringify(details));
  }

  const outputPath = path.join(DATA_DIR, 'plugins.json');
  fs.writeFileSync(outputPath, JSON.stringify(plugins), 'utf-8');
  console.log(`[build-data] Written ${plugins.length} plugins to ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
