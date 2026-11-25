import React, { useEffect, useState } from 'react';
import type { PluginData } from './types';
import { formatBytes, formatDate } from './format';
import PluginIcon from './PluginIcon';
import { PackageDownload } from './PackageDownload';

interface Props {
  plugin: PluginData;
  lang?: 'en' | 'zh';
}

const RELEASES_PER_PAGE = 5;

const i18n = {
  en: {
    backToList: 'Back to plugins',
    by: 'by',
    download: 'Download plugin',
    testing: 'Checking mirrors…',
    selected: (source: string, latencyMs?: number) =>
      latencyMs ? `Selected mirror: ${source} (${latencyMs} ms)` : `Selected mirror: ${source}`,
    manualMirrors: 'Manual download sources',
    details: 'Details',
    about: 'About',
    changelog: 'Changelog',
    assets: 'Files',
    version: 'Version',
    stdVersion: 'Standard version',
    created: 'Created',
    updated: 'Last updated',
    mainLib: 'Main library',
    noChangelog: 'No changelog available.',
    sourceReadme: 'View README on GitHub',
    repoButton: 'GitHub repository',
    allReleases: 'View all releases on GitHub',
    noReadme: 'No README available.',
    file: 'File',
    size: 'Size',
    siteLink: 'This site',
    githubRaw: 'GitHub',
    jsdelivr: 'jsDelivr',
    downloadFile: 'Download',
    zipVersion: 'Latest package',
    announcement: 'Notice',
    prevPage: 'Previous',
    nextPage: 'Next',
    paginationAria: 'Changelog pages',
    pageSummary: (page: number, total: number) => `Page ${page} of ${total}`,
  },
  zh: {
    backToList: '返回插件列表',
    announcement: '公告',
    by: '作者',
    download: '下载插件',
    testing: '正在检测下载节点…',
    selected: (source: string, latencyMs?: number) =>
      latencyMs ? `已选择${source}节点 (${latencyMs} ms)` : `已选择${source}节点`,
    manualMirrors: '手动选择下载源',
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
    repoButton: '源码仓库',
    allReleases: '在 GitHub 查看全部发布记录',
    noReadme: '暂无插件简介。',
    file: '文件',
    size: '大小',
    siteLink: '本站',
    githubRaw: 'GitHub',
    jsdelivr: 'jsDelivr',
    downloadFile: '下载',
    zipVersion: '最新安装包',
    prevPage: '上一页',
    nextPage: '下一页',
    paginationAria: '更新日志分页',
    pageSummary: (page: number, total: number) => `第 ${page} / ${total} 页`,
  },
};

type Tab = 'about' | 'changelog' | 'assets';

export default function PluginDetail({ plugin, lang = 'en' }: Props) {
  const t = i18n[lang];
  const [tab, setTab] = useState<Tab>('about');
  const [changelogPage, setChangelogPage] = useState(1);
  const [readmeLang, setReadmeLang] = useState<'en' | 'zh'>(() =>
    plugin.readmes[lang] ? lang : lang === 'en' ? 'zh' : 'en');

  useEffect(() => {
    setChangelogPage(1);
    setReadmeLang(plugin.readmes[lang] ? lang : lang === 'en' ? 'zh' : 'en');
  }, [plugin.id, lang]);

  const listHref = lang === 'zh' ? '/zh/plugins/' : '/plugins/';
  const readme = plugin.readmes[readmeLang];

  const totalPages = Math.max(1, Math.ceil(plugin.releases.length / RELEASES_PER_PAGE));
  const currentPage = Math.min(changelogPage, totalPages);
  const pageReleases = plugin.releases.slice(
    (currentPage - 1) * RELEASES_PER_PAGE,
    currentPage * RELEASES_PER_PAGE,
  );

  return (
    <div className="cp-detail">
      <div className="cp-detail-nav">
        <a href={listHref} className="cp-back-btn">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t.backToList}
        </a>
      </div>

      {plugin.announcement && (
        <div className="cp-announcement">
          <span className="cp-announcement-label">{t.announcement}</span>
          <span>{plugin.announcement}</span>
        </div>
      )}

      <div className="cp-detail-header">
        <div className="cp-detail-header-left">
          <PluginIcon plugin={plugin} variant="detail" />
          <div className="cp-detail-title">
            <h1>{plugin.name}</h1>
            <div className="cp-author-row">
              <span>{t.by} {plugin.author}</span>
              <span className="cp-tag cp-tag-accent">v{plugin.version}</span>
              <span className="cp-tag">API {plugin.standardVersion}</span>
            </div>
            <p className="cp-desc">{plugin.description}</p>
          </div>
        </div>
        {plugin.repoUrl && (
          <a
            href={plugin.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cp-btn cp-btn-secondary"
          >
            {t.repoButton}
          </a>
        )}
      </div>

      <div className="cp-detail-body">
        <PackageDownload zip={plugin.latestZip} text={t} />

        <div className="cp-detail-main">
          <div className="cp-tabs" role="tablist">
            {(['about', 'changelog', 'assets'] as Tab[]).map((tabId) => (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={tab === tabId}
                className={`cp-tab ${tab === tabId ? 'active' : ''}`}
                onClick={() => setTab(tabId)}
              >
                {t[tabId]}
                {tabId === 'changelog' && plugin.releases.length > 0 && (
                  <span className="cp-tab-badge">{plugin.releases.length}</span>
                )}
                {tabId === 'assets' && plugin.assets.length > 0 && (
                  <span className="cp-tab-badge">{plugin.assets.length}</span>
                )}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <div className="cp-tab-panel" key="about">
              {plugin.readmes.en && plugin.readmes.zh && (
                <div className="cp-lang-toggle">
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
                </div>
              )}
              {readme ? (
                <div className="cp-readme-rspress">
                  <div
                    className="rspress-doc cp-md-content"
                    lang={readmeLang}
                    dangerouslySetInnerHTML={{ __html: readme }}
                  />
                </div>
              ) : (
                <div className="cp-empty">{t.noReadme}</div>
              )}
              {plugin.repoUrl && (
                <a className="cp-upstream-link" href={plugin.repoUrl} target="_blank" rel="noopener noreferrer">
                  {t.sourceReadme}
                </a>
              )}
            </div>
          )}

          {tab === 'changelog' && (
            <div className="cp-tab-panel" key={`changelog-${currentPage}`}>
              {plugin.releases.length === 0 ? (
                <div className="cp-empty">{t.noChangelog}</div>
              ) : (
                <>
                  <div className="cp-changelog">
                    {pageReleases.map((release) => (
                      <div key={release.version} className="cp-timeline-item">
                        <div className="cp-timeline-dot" aria-hidden="true" />
                        <div className="cp-timeline-content">
                          <div className="cp-timeline-head">
                            <h4>
                              <a
                                href={release.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {release.name}
                              </a>
                            </h4>
                            <span className="cp-date">{formatDate(release.date, lang)}</span>
                          </div>
                          {release.bodyHtml && (
                            <div
                              className="cp-timeline-body rspress-doc cp-md-content"
                              dangerouslySetInnerHTML={{ __html: release.bodyHtml }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className="cp-pagination" aria-label={t.paginationAria}>
                      <button
                        type="button"
                        className="cp-page-btn"
                        disabled={currentPage <= 1}
                        onClick={() => setChangelogPage((p) => Math.max(1, p - 1))}
                      >
                        {t.prevPage}
                      </button>

                      <div className="cp-page-numbers">
                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            aria-current={pageNum === currentPage ? 'page' : undefined}
                            className={`cp-page-num ${pageNum === currentPage ? 'active' : ''}`}
                            onClick={() => setChangelogPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="cp-page-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => setChangelogPage((p) => Math.min(totalPages, p + 1))}
                      >
                        {t.nextPage}
                      </button>

                      <span className="cp-page-summary">
                        {t.pageSummary(currentPage, totalPages)}
                      </span>
                    </nav>
                  )}
                </>
              )}
              {plugin.releasesUrl && (
                <a className="cp-upstream-link" href={plugin.releasesUrl} target="_blank" rel="noopener noreferrer">
                  {t.allReleases}
                </a>
              )}
            </div>
          )}

          {tab === 'assets' && (
            <div className="cp-tab-panel" key="assets">
              <div className="cp-assets-wrap">
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
                        <td className="cp-asset-path">{asset.path}</td>
                        <td>{formatBytes(asset.size)}</td>
                        <td>
                          <a href={asset.siteRelative} download className="cp-text-link">
                            {t.downloadFile}
                          </a>
                        </td>
                        <td>
                          <a href={asset.githubRaw} target="_blank" rel="noopener noreferrer" className="cp-text-link">
                            {t.downloadFile}
                          </a>
                        </td>
                        <td>
                          <a href={asset.jsdelivr} target="_blank" rel="noopener noreferrer" className="cp-text-link">
                            {t.downloadFile}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="cp-detail-sidebar">
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
              <span className="value cp-mono">{plugin.mainLibrary}</span>
            </div>
            <div className="cp-info-row">
              <span className="label">{t.zipVersion}</span>
              <span className="value">{plugin.latestZip.version}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
