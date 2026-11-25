import React, { useState, useMemo } from 'react';
import type { PluginSummary } from './types';
import PluginIcon from './PluginIcon';
import { formatDate } from './format';

interface Props {
  plugins: PluginSummary[];
  lang?: 'en' | 'zh';
}

const i18n = {
  en: {
    title: 'Plugins',
    subtitle: 'Choose a game plugin to add to Collapse Launcher.',
    searchPlaceholder: 'Search plugins or authors',
    filterAll: 'All',
    filterAria: 'Filter by API standard version',
    results: (n: number) => `${n} plugin${n !== 1 ? 's' : ''}`,
    by: 'by',
    updated: 'Updated',
    noResults: 'No plugins match this filter.',
    resetFilters: 'Reset filters',
  },
  zh: {
    title: '插件库',
    subtitle: '选择需要添加到 Collapse Launcher 的游戏插件。',
    searchPlaceholder: '搜索插件名称或作者',
    filterAll: '全部',
    filterAria: '按 API 标准版本筛选',
    results: (n: number) => `共 ${n} 个插件`,
    by: '作者',
    updated: '更新于',
    noResults: '没有匹配的插件。',
    resetFilters: '清除筛选',
  },
};

export default function PluginList({ plugins, lang = 'en' }: Props) {
  const t = i18n[lang];
  const [query, setQuery] = useState('');
  const [apiFilter, setApiFilter] = useState<string>('all');

  const apiVersions = useMemo(() => {
    const set = new Set(plugins.map((p) => p.standardVersion).filter(Boolean));
    return Array.from(set).sort((a, b) => b.localeCompare(a, 'en', { numeric: true }));
  }, [plugins]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return plugins.filter((p) => {
      const apiOk = apiFilter === 'all' || p.standardVersion === apiFilter;
      const queryOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return apiOk && queryOk;
    });
  }, [plugins, query, apiFilter]);

  const detailBase = lang === 'zh' ? '/zh/plugins/' : '/plugins/';

  return (
    <div className="cp-page">
      <div className="cp-catalog-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="cp-catalog-bar">
        <div className="cp-search-bar">
          <svg
            className="cp-search-icon"
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            aria-label={t.searchPlaceholder}
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {apiVersions.length > 1 && (
          <div className="cp-filter-tabs" role="group" aria-label={t.filterAria}>
            <button
              type="button"
              aria-pressed={apiFilter === 'all'}
              className={`cp-filter-btn ${apiFilter === 'all' ? 'active' : ''}`}
              onClick={() => setApiFilter('all')}
            >
              {t.filterAll}
            </button>
            {apiVersions.map((ver) => (
              <button
                key={ver}
                type="button"
                aria-pressed={apiFilter === ver}
                className={`cp-filter-btn ${apiFilter === ver ? 'active' : ''}`}
                onClick={() => setApiFilter(ver)}
              >
                API {ver}
              </button>
            ))}
          </div>
        )}

        <span className="cp-catalog-count">{t.results(filtered.length)}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="cp-empty">
          <p>{t.noResults}</p>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={() => {
              setQuery('');
              setApiFilter('all');
            }}
          >
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <div className="cp-plugin-list">
          {filtered.map((plugin) => (
            <a
              key={plugin.id}
              href={`${detailBase}${plugin.id.toLowerCase()}`}
              className="cp-plugin-row"
            >
              <PluginIcon plugin={plugin} variant="card" />
              <div className="cp-plugin-row-body">
                <div className="cp-plugin-row-top">
                  <span className="cp-plugin-row-name">{plugin.name}</span>
                  <span className="cp-plugin-row-ver">v{plugin.version}</span>
                </div>
                <p className="cp-plugin-row-desc">{plugin.description}</p>
                <div className="cp-plugin-row-meta">
                  <span>API {plugin.standardVersion}</span>
                  <span>{t.by} {plugin.author}</span>
                  <span>{t.updated} {formatDate(plugin.updatedAt, lang)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
