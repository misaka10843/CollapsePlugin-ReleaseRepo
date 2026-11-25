import React, { useState } from 'react';
import type { PluginData } from './types';
import { formatBytes, formatDate } from './format';
import PluginIcon from './PluginIcon';
import { PackageDownload } from './PackageDownload';

interface Props {
  plugin: PluginData;
  lang?: 'en' | 'zh';
}

const i18n = {
  en: {
    backToList: 'Back to plugins',
    by: 'by',
    download: 'Download Plugin',
    testing: 'Checking mirrors…',
    selected: (source: string) => `Selected mirror: ${source}`,
    details: 'Details',
    about: 'About',
    changelog: 'Changelog',
    assets: 'Files',
    version: 'Version',
    stdVersion: 'Standard Version',
    created: 'Created',
    updated: 'Last Updated',
    mainLib: 'Main Library',
    noChangelog: 'No changelog available.',
    sourceReadme: 'View README on GitHub',
    allReleases: 'View releases on GitHub',
    noReadme: 'No README available.',
    file: 'File',
    size: 'Size',
    siteLink: 'This site',
    githubRaw: 'GitHub',
    jsdelivr: 'jsDelivr',
    downloadFile: 'Download',
    zipVersion: 'Latest package',
    announcement: 'Notice',
  },
  zh: {
    backToList: '返回插件列表',
    announcement: '公告',
    by: '作者',
    download: '下载插件',
    testing: '正在检测下载节点…',
    selected: (source: string) => `已选择${source}节点`,
    details: '详细信息',
    about: '简介',
    changelog: '更新日志',
    assets: '文件列表',
    version: '版本',
    stdVersion: '标准版本',
    created: '创建时间',
    updated: '最后更新',
    mainLib: '主库文件',
    noChangelog: '暂无更新日志。',
    sourceReadme: '在 GitHub 查看 README',
    allReleases: '在 GitHub 查看发布记录',
    noReadme: '暂无插件简介。',
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

export default function PluginDetail({ plugin, lang = 'en' }: Props) {
  const t = i18n[lang];
  const [tab, setTab] = useState<Tab>('about');
  const [readmeLang, setReadmeLang] = useState<'en' | 'zh'>(() =>
    plugin.readmes[lang] ? lang : lang === 'en' ? 'zh' : 'en');

  const listHref = lang === 'zh' ? '/zh/plugins/' : '/plugins/';
  const readme = plugin.readmes[readmeLang];

  return (
    <div className="cp-detail">
      <a href={listHref} className="cp-back-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {t.backToList}
      </a>

      {plugin.announcement && (
        <div className="cp-announcement">
          <span className="cp-announcement-label">{t.announcement}</span>
          <span>{plugin.announcement}</span>
        </div>
      )}

      <div className="cp-detail-header">
          <PluginIcon plugin={plugin} variant="detail" />
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
        <PackageDownload zip={plugin.latestZip} text={t} />
        <div className="cp-detail-main">
          <div className="cp-tabs">
            {(['about', 'changelog', 'assets'] as Tab[]).map((tabId) => (
              <button
                key={tabId}
                type="button"
                aria-pressed={tab === tabId}
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
              {plugin.readmes.en && plugin.readmes.zh && <div className="cp-lang-toggle" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  lang="en"
                  aria-pressed={readmeLang === 'en'}
                  className={`cp-lang-btn ${readmeLang === 'en' ? 'active' : ''}`}
                  onClick={() => setReadmeLang('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  lang="zh"
                  aria-pressed={readmeLang === 'zh'}
                  className={`cp-lang-btn ${readmeLang === 'zh' ? 'active' : ''}`}
                  onClick={() => setReadmeLang('zh')}
                >
                  中文
                </button>
              </div>}
              {readme ? (
                <div className="cp-readme-rspress">
                  <div className="rspress-doc" lang={readmeLang} dangerouslySetInnerHTML={{ __html: readme }} />
                </div>
              ) : <div className="cp-empty">{t.noReadme}</div>}
              {plugin.repoUrl && <a className="cp-upstream-link" href={plugin.repoUrl}>{t.sourceReadme}</a>}
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
                      {release.bodyHtml && (
                        <div className="cp-timeline-body rspress-doc" dangerouslySetInnerHTML={{ __html: release.bodyHtml }} />
                      )}
                    </div>
                  </div>
                ))
              )}
              {plugin.releasesUrl && <a className="cp-upstream-link" href={plugin.releasesUrl}>{t.allReleases}</a>}
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
            <div className="cp-info-row">
              <span className="label">{t.zipVersion}</span>
              <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{plugin.latestZip.version}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
