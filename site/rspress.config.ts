import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Collapse Launcher Plugins',
  description: 'Third-party plugins for Collapse Launcher',
  themeConfig: {
    darkMode: true,
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/misaka10843/CollapsePlugin-ReleaseRepo',
      },
    ],
    locales: [
      {
        lang: 'en',
        label: 'English',
        nav: [
          { text: 'Home', link: '/', activeMatch: '^/$' },
          { text: 'Plugins', link: '/plugins/', activeMatch: '^/plugins' },
          { text: 'Guide', link: '/guide/', activeMatch: '^/guide' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Introduction', link: '/guide/' },
                { text: 'Installation', link: '/guide/installation' },
              ],
            },
          ],
        },
      },
      {
        lang: 'zh',
        label: '中文',
        nav: [
          { text: '首页', link: '/zh/', activeMatch: '^/zh/$' },
          { text: '插件', link: '/zh/plugins/', activeMatch: '^/zh/plugins' },
          { text: '指南', link: '/zh/guide/', activeMatch: '^/zh/guide' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '简介', link: '/zh/guide/' },
                { text: '安装方法', link: '/zh/guide/installation' },
              ],
            },
          ],
        },
      },
    ],
  },
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Collapse Launcher Plugins',
      description: 'Third-party plugins for Collapse Launcher',
    },
    {
      lang: 'zh',
      label: '中文',
      title: 'Collapse Launcher 插件',
      description: 'Collapse Launcher 第三方插件',
    },
  ],
  lang: 'en',
  globalStyles: path.join(__dirname, 'styles', 'global.css'),
  outDir: path.join(__dirname, 'doc_build'),
  plugins: [
    pluginSitemap({ siteUrl: 'https://cl-plugins.sakurakoi.top' }),
  ],
  builderConfig: {
    tools: {
      rspack: {
        resolve: {
          alias: {
            '@data': path.join(__dirname, 'data'),
            '@components': path.join(__dirname, 'components'),
          },
        },
      },
    },
  },
});
