import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PageIndexInfo, RspressPlugin } from '@rspress/core';

export interface SeoMetadata {
  canonical: string;
  title: string;
  locale: string;
  siteName: string;
  alternateLocale?: string;
  alternates: { hreflang: string; href: string }[];
}

export const SITE_URL = 'https://cl-plugins.sakurakoi.top';

const languages = [
  { hreflang: 'en', prefix: '', locale: 'en_US', name: 'Collapse Launcher Plugins' },
  { hreflang: 'zh-Hans', prefix: '/zh', locale: 'zh_CN', name: 'Collapse Launcher 插件' },
];

function absoluteUrl(route: string) {
  return new URL(SITE_URL + route).href;
}

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function pluginSeo(outDir: string): RspressPlugin {
  let routes = new Set<string>();

  return {
    name: 'collapse-site-seo',
    routeGenerated(pages) {
      routes = new Set(pages.map(({ routePath }) => routePath));
    },
    extendPageData(page) {
      const current = page.lang === 'zh' ? languages[1] : languages[0];
      const canonical = absoluteUrl(page.routePath);
      const baseRoute = page.routePath.slice(current.prefix.length) || '/';
      const variants = languages.filter(({ prefix }) => routes.has(prefix + baseRoute));
      const isDocsPage = !page.frontmatter?.pageType || ['doc', 'doc-wide'].includes(page.frontmatter.pageType);
      const title = isDocsPage && page.title && !page.title.includes('Collapse Launcher')
        ? `${page.title} | ${current.name}`
        : page.title || current.name;
      const seo: SeoMetadata = {
        canonical,
        title,
        locale: current.locale,
        siteName: current.name,
        alternateLocale: variants.find((variant) => variant !== current)?.locale,
        alternates: variants.length > 1 ? [
          ...variants.map(({ hreflang, prefix }) => ({ hreflang, href: absoluteUrl(prefix + baseRoute) })),
          { hreflang: 'x-default', href: absoluteUrl(baseRoute) },
        ] : [],
      };
      (page as PageIndexInfo & { seo?: SeoMetadata }).seo = seo;
    },
    async afterBuild(_config, isProd) {
      if (!isProd) return;
      const urls = [...routes].filter((route) => route !== '/404').sort()
        .map((route) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc></url>`);
      await writeFile(path.join(outDir, 'sitemap.xml'), [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        '',
      ].join('\n'));
    },
  };
}
