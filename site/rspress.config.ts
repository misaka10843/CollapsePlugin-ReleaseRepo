import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BROWSER_LANG_REDIRECT_SCRIPT = `(function(){try{if(sessionStorage.getItem('cp-lang-init'))return;sessionStorage.setItem('cp-lang-init','1');var p=location.pathname;if(p.startsWith('/zh/')||p==='/zh')return;var lang=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(/^zh\\b/i.test(lang)){var target='/zh'+(p==='/'?'/':p)+location.search+location.hash;location.replace(target);}}catch(e){}})();`;

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Collapse Launcher Plugins',
  description: 'Third-party plugins for Collapse Launcher',
  head: [
    `<script>${BROWSER_LANG_REDIRECT_SCRIPT}</script>`,
  ],
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
  globalStyles: path.join(__dirname, 'styles', 'global.css'),
  outDir: path.join(__dirname, 'doc_build'),
  plugins: [
    pluginSitemap({ siteUrl: 'https://cl-plugins.sakurakoi.top' }),
  ],
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
