import React from 'react';
import type { PluginSummary } from './types';
import PluginIcon from './PluginIcon';

interface Props {
  plugins: PluginSummary[];
  lang?: 'en' | 'zh';
}

const i18n = {
  en: {
    title: 'Collapse Launcher',
    titleAccent: 'Plugins',
    subtitle: 'Third-party plugins extending Collapse Launcher with support for more games.',
    browse: 'Browse Plugins →',
    statsPlugins: 'Plugins',
    featuredTitle: 'Available Plugins',
  },
  zh: {
    title: 'Collapse Launcher',
    titleAccent: '第三方插件',
    subtitle: '为 Collapse Launcher 提供更多游戏支持的第三方插件。',
    browse: '浏览所有插件 →',
    statsPlugins: '个插件',
    featuredTitle: '可用插件',
  },
};

function PluginMiniCard({ plugin, lang }: { plugin: PluginSummary; lang: 'en' | 'zh' }) {
  const href = lang === 'zh' ? `/zh/plugins/${plugin.id.toLowerCase()}` : `/plugins/${plugin.id.toLowerCase()}`;
  return (
    <a href={href} className="cp-card" style={{ textDecoration: 'none' }}>
      <div className="cp-card-header">
        <PluginIcon plugin={plugin} variant="card" />
        <div className="cp-card-meta">
          <div className="cp-card-name">{plugin.name}</div>
          <div className="cp-card-author">{lang === 'zh' ? '作者' : 'by'} {plugin.author}</div>
        </div>
        <span className="cp-card-version">v{plugin.version}</span>
      </div>
      <div className="cp-card-desc">{plugin.description}</div>
    </a>
  );
}

export default function LandingPage({ plugins, lang = 'en' }: Props) {
  const t = i18n[lang];
  const pluginsHref = lang === 'zh' ? '/zh/plugins/' : '/plugins/';

  return (
    <div className="cp-landing">
      <div className="cp-landing-hero">
        <h1>
          {t.title} <span>{t.titleAccent}</span>
        </h1>
        <p>{t.subtitle}</p>
        <a href={pluginsHref} className="cp-landing-cta">
          {t.browse}
        </a>
        <div className="cp-landing-stats">
          <div className="cp-stat">
            <div className="cp-stat-value">{plugins.length}</div>
            <div className="cp-stat-label">{t.statsPlugins}</div>
          </div>
        </div>
      </div>

      <div className="cp-landing-preview">
        <h2>{t.featuredTitle}</h2>
        <div className="cp-grid">
          {plugins.map((p) => (
            <PluginMiniCard key={p.id} plugin={p} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}
