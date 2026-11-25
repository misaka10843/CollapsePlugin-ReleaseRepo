import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const releaseRequests = new Map();

const ALERT_TYPES = {
  NOTE: { cls: 'note', label: 'Note' },
  TIP: { cls: 'tip', label: 'Tip' },
  IMPORTANT: { cls: 'important', label: 'Important' },
  WARNING: { cls: 'warning', label: 'Warning' },
  CAUTION: { cls: 'caution', label: 'Caution' },
};

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

/**
 * CommonMark flanking rules fail to close `**bold**` when inner text ends with
 * ASCII punctuation (like `)` or `]`) and is immediately followed by CJK text
 * (e.g. `**星塔旅人(StellaSora)**的游戏`). Normalize those spans outside code.
 */
function preprocessCjkEmphasis(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let inFence = false;
  let fenceChar = '';

  return lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
      if (fenceMatch) {
        if (!inFence) {
          inFence = true;
          fenceChar = fenceMatch[1][0];
        } else if (fenceMatch[1][0] === fenceChar) {
          inFence = false;
          fenceChar = '';
        }
        return line;
      }
      if (inFence) return line;

      // Split by inline code spans so we never touch code
      return line
        .split(/(`+[^`]*`+)/g)
        .map((segment, idx) => {
          if (idx % 2 === 1) return segment;
          // Convert **...** when adjacent to CJK or punctuation where CommonMark fails
          return segment.replace(
            /\*\*([^\n*][^\n]*?[^\n*\s])\*\*(?=[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef])/g,
            '<strong>$1</strong>',
          );
        })
        .join('');
    })
    .join('\n');
}

/**
 * Transform GitHub Alert blockquotes:
 *   > [!IMPORTANT]
 *   > Content...
 * into semantic `.cp-md-alert` containers.
 */
function transformGithubAlerts(html) {
  return html.replace(
    /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:<br\s*\/?>|\s*\n)?([\s\S]*?)<\/blockquote>/gi,
    (_, rawType, rest) => {
      const info = ALERT_TYPES[rawType.toUpperCase()];
      if (!info) return _;
      const body = rest.trimStart();
      const normalizedBody = body.startsWith('</p>')
        ? body.slice(4)
        : `<p>${body}`;
      return `<div class="cp-md-alert cp-md-alert-${info.cls}"><p class="cp-md-alert-title">${info.label}</p>${normalizedBody}</div>`;
    },
  );
}

export function renderMarkdown(markdown, { linkBase, imageBase } = {}) {
  if (!markdown) return '';
  const prepared = preprocessCjkEmphasis(markdown);
  const rawHtml = marked.parse(prepared, { gfm: true, breaks: false });
  const withAlerts = transformGithubAlerts(typeof rawHtml === 'string' ? rawHtml : '');

  return sanitizeHtml(withAlerts, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'del',
      'details',
      'summary',
      'input',
      'kbd',
      'sup',
      'sub',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'br',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      ol: ['start'],
      p: ['align', 'class'],
      div: ['align', 'class'],
      code: ['class'],
      input: ['type', 'checked', 'disabled'],
      th: ['align'],
      td: ['align'],
    },
    allowedClasses: {
      div: [
        'cp-md-alert',
        'cp-md-alert-note',
        'cp-md-alert-tip',
        'cp-md-alert-important',
        'cp-md-alert-warning',
        'cp-md-alert-caution',
      ],
      p: ['cp-md-alert-title'],
      code: [/^language-[\w-]+$/],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attributes) => ({ tagName, attribs: resolveAttribute(attributes, 'href', linkBase) }),
      img: (tagName, attributes) => ({
        tagName,
        attribs: { ...resolveAttribute(attributes, 'src', imageBase), loading: 'lazy' },
      }),
      input: (tagName, attributes) => {
        if (attributes.type !== 'checkbox') return { tagName: 'span', attribs: {} };
        return {
          tagName,
          attribs: {
            type: 'checkbox',
            disabled: 'disabled',
            ...(attributes.checked !== undefined ? { checked: 'checked' } : {}),
          },
        };
      },
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
