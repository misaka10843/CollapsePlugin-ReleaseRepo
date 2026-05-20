import React, { useState } from 'react';
import type { PluginData } from './types';
import { useDownload } from './useDownload';

interface Props {
  plugin: PluginData;
  lang?: 'en' | 'zh';
  ReadmeEn?: React.ComponentType;
  ReadmeZh?: React.ComponentType;
}

const i18n = {
  en: {
    backToList: 'Back to plugins',
    by: 'by',
    download: 'Download Plugin',
    downloading: 'Starting download...',
    testing: 'Testing speed...',
    speedError: 'All mirrors unavailable. Please download manually.',
    usingMirror: (label: string) => `Downloading via ${label}`,
    details: 'Details',
    about: 'About',
    changelog: 'Changelog',
    assets: 'Files',
    version: 'Version',
    stdVersion: 'Standard Version',
    created: 'Created',
    updated: 'Last Updated',
    mainLib: 'Main Library',
    noReadme: 'No documentation available.',
    noChangelog: 'No changelog available.',
    file: 'File',
    size: 'Size',
    siteLink: 'This site',
    githubRaw: 'GitHub',
    jsdelivr: 'jsDelivr',
    downloadFile: 'Download',
    zipVersion: 'Latest package',
  },
  zh: {
    backToList: '返回插件列表',
    by: '作者',
    download: '下载插件',
    downloading: '开始下载...',
    testing: '测速中...',
    speedError: '所有节点不可用，请手动下载。',
    usingMirror: (label: string) => `正在通过 ${label} 下载`,
    details: '详细信息',
    about: '简介',
    changelog: '更新日志',
    assets: '文件列表',
    version: '版本',
    stdVersion: '标准版本',
    created: '创建时间',
    updated: '最后更新',
    mainLib: '主库文件',
    noReadme: '暂无文档。',
    noChangelog: '暂无更新日志。',
    file: '文件',
    size: '大小',
    siteLink: '本站',
    githubRaw: 'GitHub',
    jsdelivr: 'jsDelivr',
    downloadFile: '下载',
    zipVersion: '最新安装包',
  },
};

type Tab = 'about' | 'changelog' | 'assets';

function formatDate(iso: string, lang: 'en' | 'zh'): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
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
        className="cp-detail-icon"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div className="cp-detail-icon-placeholder">
      {plugin.name.charAt(0).toUpperCase()}
    </div>
  );
}

function DownloadButton({ plugin, t }: { plugin: PluginData; t: typeof i18n['en'] }) {
  const { status, bestLabel, triggerDownload } = useDownload(plugin);

  if (!plugin.latestZip) return null;

  const isLoading = status === 'testing';
  const btnLabel = isLoading ? t.testing : t.download;
  const statusMsg = status === 'error'
    ? t.speedError
    : status === 'done' && bestLabel
      ? t.usingMirror(bestLabel)
      : '';

  return (
    <div>
      <button
        className={`cp-download-btn ${isLoading ? 'loading' : ''}`}
        onClick={triggerDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="cp-spinner" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        {btnLabel}
      </button>
      {statusMsg && (
        <div className={`cp-speed-status ${status === 'done' ? 'ok' : status === 'error' ? 'error' : 'testing'}`}>
          {statusMsg}
        </div>
      )}
    </div>
  );
}

export default function PluginDetail({ plugin, lang = 'en', ReadmeEn, ReadmeZh }: Props) {
  const t = i18n[lang];
  const [tab, setTab] = useState<Tab>('about');
  const [readmeLang, setReadmeLang] = useState<'en' | 'zh'>(lang);

  const listHref = lang === 'zh' ? '/zh/plugins/' : '/plugins/';
  const ReadmeComponent = readmeLang === 'zh' ? (ReadmeZh || ReadmeEn) : (ReadmeEn || ReadmeZh);
  const readmeHtml = !ReadmeComponent
    ? (plugin.readmeHtml[readmeLang] || plugin.readmeHtml[lang === 'zh' ? 'en' : 'zh'])
    : null;

  return (
    <div className="cp-detail">
      <a href={listHref} className="cp-back-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {t.backToList}
      </a>

      <div className="cp-detail-header">
        <PluginIcon plugin={plugin} />
        <div className="cp-detail-title">
          <h1>{plugin.name}</h1>
          <div className="cp-author-row">
            <span>{t.by} {plugin.author}</span>
            <span className="cp-badge cp-badge-version">v{plugin.version}</span>
          </div>
          <div className="cp-desc">{plugin.description}</div>
        </div>
      </div>

      <div className="cp-detail-body">
        <div className="cp-detail-main">
          <div className="cp-tabs">
            {(['about', 'changelog', 'assets'] as Tab[]).map((tabId) => (
              <button
                key={tabId}
                className={`cp-tab ${tab === tabId ? 'active' : ''}`}
                onClick={() => setTab(tabId)}
              >
                {t[tabId]}
                {tabId === 'changelog' && plugin.releases.length > 0 && (
                  <span style={{ marginLeft: 6, fontSize: '0.72rem', background: 'var(--cp-accent-light)', color: 'var(--cp-accent)', padding: '1px 6px', borderRadius: 10 }}>
                    {plugin.releases.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <div>
              <div className="cp-lang-toggle" style={{ marginBottom: 12 }}>
                <button
                  className={`cp-lang-btn ${readmeLang === 'en' ? 'active' : ''}`}
                  onClick={() => setReadmeLang('en')}
                >
                  English
                </button>
                <button
                  className={`cp-lang-btn ${readmeLang === 'zh' ? 'active' : ''}`}
                  onClick={() => setReadmeLang('zh')}
                >
                  中文
                </button>
              </div>
              {ReadmeComponent ? (
                <div className="cp-readme-rspress">
                  <div className="rspress-doc">
                    <ReadmeComponent />
                  </div>
                </div>
              ) : readmeHtml ? (
                <div
                  className="cp-readme-html"
                  dangerouslySetInnerHTML={{ __html: readmeHtml }}
                />
              ) : (
                <div className="cp-readme-html">
                  <p style={{ color: 'var(--cp-text-muted)' }}>{t.noReadme}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'changelog' && (
            <div className="cp-changelog">
              {plugin.releases.length === 0 ? (
                <div className="cp-empty">{t.noChangelog}</div>
              ) : (
                plugin.releases.map((release) => (
                  <div key={release.version} className="cp-timeline-item">
                    <div className="cp-timeline-dot" />
                    <div className="cp-timeline-content">
                      <h4>
                        <a href={release.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cp-text)', textDecoration: 'none' }}>
                          {release.name}
                        </a>
                      </h4>
                      <div className="cp-date">{formatDate(release.date, lang)}</div>
                      {release.body && (
                        <div className="cp-timeline-body">{release.body}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'assets' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="cp-assets-table">
                <thead>
                  <tr>
                    <th>{t.file}</th>
                    <th>{t.size}</th>
                    <th>{t.siteLink}</th>
                    <th>{t.githubRaw}</th>
                    <th>{t.jsdelivr}</th>
                  </tr>
                </thead>
                <tbody>
                  {plugin.assets.map((asset) => (
                    <tr key={asset.path}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--cp-text)' }}>{asset.path}</td>
                      <td>{formatBytes(asset.size)}</td>
                      <td>
                        <a href={asset.siteRelative} download style={{ color: 'var(--cp-accent)' }}>
                          {t.downloadFile}
                        </a>
                      </td>
                      <td>
                        <a href={asset.githubRaw} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cp-accent)' }}>
                          {t.downloadFile}
                        </a>
                      </td>
                      <td>
                        <a href={asset.jsdelivr} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cp-accent)' }}>
                          {t.downloadFile}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cp-detail-sidebar">
          <DownloadButton plugin={plugin} t={t} />

          <div className="cp-sidebar-card">
            <h3>{t.details}</h3>
            <div className="cp-info-row">
              <span className="label">{t.version}</span>
              <span className="value">{plugin.version}</span>
            </div>
            <div className="cp-info-row">
              <span className="label">{t.stdVersion}</span>
              <span className="value">{plugin.standardVersion}</span>
            </div>
            <div className="cp-info-row">
              <span className="label">{t.created}</span>
              <span className="value">{formatDate(plugin.createdAt, lang)}</span>
            </div>
            <div className="cp-info-row">
              <span className="label">{t.updated}</span>
              <span className="value">{formatDate(plugin.updatedAt, lang)}</span>
            </div>
            <div className="cp-info-row">
              <span className="label">{t.mainLib}</span>
              <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{plugin.mainLibrary}</span>
            </div>
            {plugin.latestZip && (
              <div className="cp-info-row">
                <span className="label">{t.zipVersion}</span>
                <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{plugin.latestZip.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
