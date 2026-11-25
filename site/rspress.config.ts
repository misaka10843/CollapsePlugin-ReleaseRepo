import { defineConfig } from '@rspress/core';
import path from 'path';
import { fileURLToPath } from 'url';
import { pluginSeo } from './scripts/seo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, 'doc_build');

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Collapse Launcher Plugins',
  description: 'Third-party plugins for Collapse Launcher',
  themeConfig: {
    darkMode: true,
    localeRedirect: 'never',
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
                { text: 'Submit & Publish', link: '/guide/publishing' },
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
                { text: '发布插件', link: '/zh/guide/publishing' },
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
  route: { cleanUrls: true },
  globalStyles: path.join(__dirname, 'styles', 'global.css'),
  globalUIComponents: [path.join(__dirname, 'components', 'PageSeo.tsx')],
  outDir,
  plugins: [pluginSeo(outDir)],
  builderConfig: {
    server: {
      publicDir: { name: path.join(__dirname, '.generated', 'public') },
    },
    tools: {
      rspack: {
        resolve: {
          alias: {
            '@data': path.join(__dirname, '.generated', 'data'),
            '@components': path.join(__dirname, 'components'),
          },
        },
      },
    },
  },
});
