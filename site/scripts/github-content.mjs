import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const releaseRequests = new Map();

async function fetchOptional(url, read, token) {
  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return await read(response);
    if (response.status !== 404) console.warn(`[build-data] ${url}: HTTP ${response.status}`);
  } catch (error) {
    console.warn(`[build-data] ${url}: ${error.message}`);
  }
  return null;
}

function resolveAttribute(attributes, key, base) {
  const value = attributes[key];
  if (!value || !base) return attributes;
  try {
    return { ...attributes, [key]: new URL(value, base).href };
  } catch {
    const updated = { ...attributes };
    delete updated[key];
    return updated;
  }
}

export function renderMarkdown(markdown, { linkBase, imageBase } = {}) {
  if (!markdown) return '';
  return sanitizeHtml(marked.parse(markdown), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'del', 'details', 'summary'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      ol: ['start'],
      p: ['align'],
      div: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attributes) => ({ tagName, attribs: resolveAttribute(attributes, 'href', linkBase) }),
      img: (tagName, attributes) => ({
        tagName,
        attribs: { ...resolveAttribute(attributes, 'src', imageBase), loading: 'lazy' },
      }),
    },
  });
}

export async function readRepositoryContent(meta) {
  const { repository, readmeRef = 'main', releaseTagPrefix } = meta;
  if (!repository) return { readmes: {}, releases: [] };
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error(`Invalid GitHub repository: ${repository}`);

  const repoUrl = `https://github.com/${repository}`;
  const imageBase = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(readmeRef)}/`;
  const linkBase = `${repoUrl}/blob/${encodeURIComponent(readmeRef)}/`;
  const releasesUrl = `${repoUrl}/releases`;
  if (!releaseRequests.has(repository)) {
    releaseRequests.set(repository,
      fetchOptional(`https://api.github.com/repos/${repository}/releases?per_page=100`,
        (response) => response.json(), process.env.GITHUB_TOKEN));
  }

  const readme = async (filename) => {
    const markdown = await fetchOptional(new URL(filename, imageBase), (response) => response.text());
    return renderMarkdown(markdown, { linkBase: new URL(filename, linkBase), imageBase });
  };
  const [en, zh, entries] = await Promise.all([
    readme('README.md'),
    readme('README.zh-CN.md'),
    releaseRequests.get(repository),
  ]);
  const releases = (Array.isArray(entries) ? entries : [])
    .filter((entry) => !entry.draft && (!releaseTagPrefix || entry.tag_name.startsWith(releaseTagPrefix)))
    .slice(0, 20)
    .map((entry) => ({
      version: entry.tag_name,
      name: entry.name || entry.tag_name,
      date: entry.published_at,
      bodyHtml: renderMarkdown(entry.body, { linkBase, imageBase }),
      url: `${releasesUrl}/tag/${encodeURIComponent(entry.tag_name)}`,
    }));
  return { readmes: { en, zh }, releases, repoUrl, releasesUrl };
}
