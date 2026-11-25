import React, { useEffect, useRef, useState } from 'react';
import type { PluginSummary } from './types';
import PluginIcon from './PluginIcon';
import { formatDate } from './format';

interface Props {
  plugins: PluginSummary[];
  lang?: 'en' | 'zh';
}

const AUTO_ROTATE_MS = 6000;

const i18n = {
  en: {
    heading: 'Collapse Launcher Plugins',
    subtitle: 'Community fourth-party game modules for Collapse Launcher with fast mirror downloads and clear API tracking.',
    quickCatalog: 'Browse catalog',
    quickGuide: 'Installation',
    quickPublish: 'Submit a plugin',
    stageAria: 'Featured game plugin showcase',
    dockAria: 'Switch featured plugin',
    by: 'by',
    updated: 'Updated',
    viewAndDownload: 'Download & details',
    installGuide: 'Install guide',
    prevPlugin: 'Previous plugin',
    nextPlugin: 'Next plugin',
    pauseRotate: 'Pause auto-switch',
    resumeRotate: 'Resume auto-switch',
    allPlugins: 'Available plugins',
    openCatalog: 'View all plugins',
    installTitle: 'Install into Collapse Launcher',
    fullGuide: 'Full installation guide',
    step1Title: 'Download the ZIP package',
    step1Desc: 'Open a plugin page and download the latest ZIP. Mirrors are probed automatically, or you can pick one manually.',
    step2Title: 'Import in Plugin Manager',
    step2Desc: 'Open Collapse Launcher Settings, enter Plugin Management, and import the downloaded ZIP file.',
    step3Title: 'Restart & play',
    step3Desc: 'Restart Collapse Launcher to see the new game entry ready for download, repair, and launching.',
    publishTitle: 'Built for the community',
    publishDesc: 'Each plugin is packaged with its manifest, DLL, and multi-mirror links. Want to share your own Collapse plugin?',
    feat1: 'Auto latency probing across Site, GitHub & jsDelivr',
    feat2: 'Clear Collapse Plugin Standard API compatibility',
    feat3: 'Automated GitHub Actions validation & publishing',
    publishCta: 'Read publishing guide',
    repoLink: 'GitHub repository',
  },
  zh: {
    heading: 'Collapse Launcher 社区插件库',
    subtitle: '面向 Collapse Launcher 的二次元游戏第四方扩展仓库，提供多源测速下载与清晰的版本兼容追踪。',
    quickCatalog: '浏览插件库',
    quickGuide: '安装方法',
    quickPublish: '发布插件',
    stageAria: '精选游戏插件轮播舞台',
    dockAria: '切换展示的插件',
    by: '作者',
    updated: '更新于',
    viewAndDownload: '查看详情与下载',
    installGuide: '安装指南',
    prevPlugin: '上一个插件',
    nextPlugin: '下一个插件',
    pauseRotate: '暂停自动切换',
    resumeRotate: '恢复自动切换',
    allPlugins: '已收录插件',
    openCatalog: '打开全部插件',
    installTitle: '三步安装到 Collapse Launcher',
    fullGuide: '查看完整图文指南',
    step1Title: '下载插件 ZIP 包',
    step1Desc: '进入对应游戏插件详情页下载最新安装包。支持自动测速选取最快节点，也可手动切换。',
    step2Title: '在启动器中导入',
    step2Desc: '在 Collapse Launcher 设置中打开插件管理菜单，直接选中刚下载的 ZIP 压缩包导入。',
    step3Title: '重启启动器并游玩',
    step3Desc: '重启后即可在启动器游戏列表中看到新增游戏，统一管理下载、校验与启动。',
    publishTitle: '开放的社区插件生态',
    publishDesc: '所有插件均随清单、主库与上游更新日志公开发布。欢迎将你开发的 Collapse 插件提交到本仓库。',
    feat1: '本站 / GitHub / jsDelivr 三节点自动测速分发',
    feat2: '清晰标注各插件对应的 Collapse API 标准版本',
    feat3: '开源仓库与 GitHub Actions 自动化校验发布',
    publishCta: '查看发布插件教程',
    repoLink: 'GitHub 仓库',
  },
};

export default function LandingPage({ plugins, lang = 'en' }: Props) {
  const t = i18n[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const detailBase = lang === 'zh' ? '/zh/plugins/' : '/plugins/';
  const catalogHref = lang === 'zh' ? '/zh/plugins/' : '/plugins/';
  const guideHref = lang === 'zh' ? '/zh/guide/installation' : '/guide/installation';
  const publishHref = lang === 'zh' ? '/zh/guide/publishing' : '/guide/publishing';

  const safeIndex = plugins.length > 0 ? Math.min(activeIndex, plugins.length - 1) : 0;
  const active = plugins[safeIndex];
  const isAutoPlaying = plugins.length > 1 && !paused && !hovering;

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % plugins.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, plugins.length]);

  useEffect(() => {
    const el = itemRefs.current[safeIndex];
    const container = dockRef.current;
    if (!el || !container) return;
    const targetLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, [safeIndex]);

  function stepPlugin(delta: number) {
    if (plugins.length === 0) return;
    setActiveIndex((prev) => (prev + delta + plugins.length) % plugins.length);
  }

  function onDockKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      stepPlugin(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      stepPlugin(-1);
    }
  }

  return (
    <div className="cp-landing">
      <header className="cp-home-masthead">
        <div className="cp-home-masthead-text">
          <h1>{t.heading}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="cp-home-quicklinks">
          <a href={catalogHref} className="cp-btn cp-btn-primary">{t.quickCatalog}</a>
          <a href={guideHref} className="cp-btn cp-btn-secondary">{t.quickGuide}</a>
          <a href={publishHref} className="cp-btn cp-btn-secondary">{t.quickPublish}</a>
        </div>
      </header>

      {active && (
        <section
          className="cp-stage"
          aria-label={t.stageAria}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setHovering(false);
            }
          }}
        >
          <div className="cp-stage-deck" key={active.id}>
            {active.icon && (
              <img
                className="cp-stage-backdrop"
                src={active.icon}
                alt=""
                aria-hidden="true"
              />
            )}
            <div className="cp-stage-slash" aria-hidden="true" />

            <div className="cp-stage-top">
              <div className="cp-stage-index-pill">
                <span className="cp-stage-index-num">
                  {String(safeIndex + 1).padStart(2, '0')}
                </span>
                <span className="cp-stage-index-total">
                  / {String(plugins.length).padStart(2, '0')}
                </span>
              </div>

              <div className="cp-stage-controls">
                {plugins.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="cp-stepper-btn"
                      aria-label={paused ? t.resumeRotate : t.pauseRotate}
                      aria-pressed={paused}
                      onClick={() => setPaused((p) => !p)}
                    >
                      {paused ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 4 20 12 6 20 6 4" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className="cp-stepper-btn"
                      aria-label={t.prevPlugin}
                      onClick={() => stepPlugin(-1)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="cp-stepper-btn"
                      aria-label={t.nextPlugin}
                      onClick={() => stepPlugin(1)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="cp-stage-content">
              <div className="cp-stage-game-head">
                <PluginIcon plugin={active} variant="stage" />
                <div className="cp-stage-game-titles">
                  <h2>{active.name}</h2>
                  <div className="cp-stage-author">{t.by} {active.author}</div>
                </div>
              </div>

              <p className="cp-stage-desc">{active.description}</p>

              <div className="cp-stage-bottom">
                <div className="cp-meta-tags">
                  <span className="cp-tag cp-tag-accent">v{active.version}</span>
                  <span className="cp-tag">API {active.standardVersion}</span>
                  <span className="cp-tag">
                    {t.updated} {formatDate(active.updatedAt, lang)}
                  </span>
                </div>

                <div className="cp-stage-actions">
                  <a
                    href={`${detailBase}${active.id.toLowerCase()}`}
                    className="cp-btn cp-btn-primary cp-btn-angled"
                  >
                    {t.viewAndDownload}
                  </a>
                  <a href={guideHref} className="cp-btn cp-btn-secondary">
                    {t.installGuide}
                  </a>
                </div>
              </div>
            </div>

            {plugins.length > 1 && (
              <div className="cp-stage-progress" aria-hidden="true">
                <span
                  key={`${active.id}-${isAutoPlaying ? 'play' : 'pause'}`}
                  className={`cp-stage-progress-fill ${isAutoPlaying ? 'running' : ''}`}
                  style={{ animationDuration: `${AUTO_ROTATE_MS}ms` }}
                />
              </div>
            )}
          </div>

          {/* Scalable Horizontal Game Dock (handles 4 or 40+ plugins with auto-scroll) */}
          <div
            ref={dockRef}
            className="cp-stage-dock"
            role="tablist"
            aria-label={t.dockAria}
            onKeyDown={onDockKeyDown}
          >
            {plugins.map((plugin, index) => {
              const isActive = index === safeIndex;
              return (
                <button
                  key={plugin.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`cp-dock-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <PluginIcon plugin={plugin} variant="rail" />
                  <span className="cp-dock-pill-text">
                    <span className="cp-dock-pill-name">{plugin.name}</span>
                    <span className="cp-dock-pill-ver">v{plugin.version}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="cp-section">
        <div className="cp-section-head">
          <h2>{t.allPlugins}</h2>
          <a href={catalogHref} className="cp-text-link">{t.openCatalog}</a>
        </div>
        <div className="cp-plugin-list">
          {plugins.map((plugin) => (
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
      </section>

      <section className="cp-section cp-home-lower">
        <div className="cp-lower-card">
          <div className="cp-section-head">
            <h2>{t.installTitle}</h2>
            <a href={guideHref} className="cp-text-link">{t.fullGuide}</a>
          </div>
          <ol className="cp-steps-list">
            <li>
              <span className="cp-step-index">1</span>
              <div>
                <h3>{t.step1Title}</h3>
                <p>{t.step1Desc}</p>
              </div>
            </li>
            <li>
              <span className="cp-step-index">2</span>
              <div>
                <h3>{t.step2Title}</h3>
                <p>{t.step2Desc}</p>
              </div>
            </li>
            <li>
              <span className="cp-step-index">3</span>
              <div>
                <h3>{t.step3Title}</h3>
                <p>{t.step3Desc}</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="cp-lower-card cp-publish-card">
          <h2>{t.publishTitle}</h2>
          <p className="cp-publish-desc">{t.publishDesc}</p>
          <ul className="cp-feat-list">
            <li>{t.feat1}</li>
            <li>{t.feat2}</li>
            <li>{t.feat3}</li>
          </ul>
          <div className="cp-publish-actions">
            <a href={publishHref} className="cp-btn cp-btn-primary">{t.publishCta}</a>
            <a
              href="https://github.com/misaka10843/CollapsePlugin-ReleaseRepo"
              target="_blank"
              rel="noopener noreferrer"
              className="cp-btn cp-btn-secondary"
            >
              {t.repoLink}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
