import React, { useState, useMemo } from 'react';
import type { PluginData } from './types';

interface Props {
  plugins: PluginData[];
  lang?: 'en' | 'zh';
}

const i18n = {
  en: {
    title: 'Plugins',
    subtitle: 'Third-party plugins for Collapse Launcher',
    searchPlaceholder: 'Search plugins...',
    results: (n: number) => `${n} plugin${n !== 1 ? 's' : ''}`,
    by: 'by',
    version: 'v',
    noResults: 'No plugins found.',
    updated: 'Updated',
    viewDetails: 'View details →',
  },
  zh: {
    title: '插件',
    subtitle: 'Collapse Launcher 第三方插件',
    searchPlaceholder: '搜索插件…',
    results: (n: number) => `共 ${n} 个插件`,
    by: '作者',
    version: 'v',
    noResults: '未找到插件。',
    updated: '更新于',
    viewDetails: '查看详情 →',
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function PluginIcon({ plugin }: { plugin: PluginData }) {
  const [error, setError] = useState(false);
  if (plugin.icon && !error) {
    return (
      <img
        src={plugin.icon}
        alt={plugin.name}
        className="cp-card-icon"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div className="cp-card-icon-placeholder">
      {plugin.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function PluginList({ plugins, lang = 'en' }: Props) {
  const t = i18n[lang];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return plugins;
    return plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }, [plugins, query]);

  const detailBase = lang === 'zh' ? '/zh/plugins/' : '/plugins/';

  return (
    <div className="cp-page">
      <div className="cp-hero">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <div className="cp-search-bar">
          <svg className="cp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p style={{ color: 'var(--cp-text-muted)', fontSize: '0.88rem', marginBottom: 0 }}>
          {t.results(filtered.length)}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="cp-empty">{t.noResults}</div>
      ) : (
        <div className="cp-grid">
          {filtered.map((plugin) => (
            <a
              key={plugin.id}
              href={`${detailBase}${plugin.id.toLowerCase()}`}
              className="cp-card"
            >
              <div className="cp-card-header">
                <PluginIcon plugin={plugin} />
                <div className="cp-card-meta">
                  <div className="cp-card-name">{plugin.name}</div>
                  <div className="cp-card-author">{t.by} {plugin.author}</div>
                </div>
                <span className="cp-card-version">{t.version}{plugin.version}</span>
              </div>
              <div className="cp-card-desc">{plugin.description}</div>
              <div className="cp-card-footer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {t.updated} {formatDate(plugin.updatedAt)}
                <span style={{ marginLeft: 'auto', color: 'var(--cp-accent)', fontSize: '0.8rem' }}>
                  {t.viewDetails}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
