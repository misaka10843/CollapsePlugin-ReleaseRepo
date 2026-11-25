# Collapse Launcher 插件

[English](./README.md) · **简体中文**

这里收录了 Collapse Launcher 的第三方插件。打开[插件列表](https://cl-plugins.sakurakoi.top/zh/plugins/)，找到想要的插件，再下载 ZIP 安装包。

## 🧩 安装插件

1. 从插件详情页下载 ZIP。
2. 在 Collapse Launcher 中打开 **设置 → 打开插件管理菜单**。
3. 点击 **点击添加 .zip 或 manifest.json**，选中刚下载的 ZIP，然后重启启动器。

需要截图的话，可以看看[安装指南](./site/docs/zh/guide/installation.md)。

## 🛠️ 本地运行网站

使用 Node.js 22 和 pnpm 10，在仓库根目录运行：

```sh
pnpm --dir site install --frozen-lockfile
pnpm --dir site dev
```

打开 Rspress 在终端里打印的地址。启动时会用本地插件文件生成列表和下载内容。换了清单或 ZIP 后，重启开发服务器即可。开发模式下，主下载按钮直接取本地 ZIP，方便检查刚打好的包。

克隆时想跳过旧版本的安装包，可以用 `git clone --depth 1 --single-branch --branch main https://github.com/misaka10843/CollapsePlugin-ReleaseRepo.git`。

## 🤝 投稿你的插件

自己写了 Collapse Launcher 插件，想让其他人也能用？欢迎提 PR。请在 PR 里附上源码仓库链接，说明支持哪些游戏和区服，以及你用哪个版本的启动器测试过。

1. 给插件取一个唯一 ID，例如 `MyGame`。两个目录都使用同样的拼写和大小写。
2. 在 `MyGame/` 放入 `manifest.json`、插件 DLL 和运行所需的文件。把能直接安装的 ZIP 放进 `MyGame/build/`，文件名用 `MyGame_<版本>_API-<API版本>_<YYYYMMDD>.zip`。
3. 在 `site/plugins/MyGame/meta.json` 中把 `repository` 填成 GitHub 的 `owner/name`。网站会读取该仓库的 README 和 Releases。README 在其他分支时填 `readmeRef`，一个仓库发多个插件时用 `releaseTagPrefix` 指定这个插件的标签前缀。也可以在同一目录放本地 README，供 GitHub 读取失败时使用。
4. 各复制一份[英文](./site/docs/plugins/arknights.mdx)和[中文](./site/docs/zh/plugins/arknights.mdx)详情页，命名为 `mygame.mdx`，把插件数据导入路径和图标地址改成自己的。
5. 提交 PR 前，运行 `pnpm --dir site build`，再用 Collapse Launcher 安装 ZIP 试一下。

## 发布

每个插件的 `build/` 只保留一个可安装的 ZIP。发版 PR 里用新 ZIP 替换旧包，同时更新清单和 DLL，删掉新版本用不到的运行文件。需要提供旧包或调试符号的话，把它们放到插件自己的 GitHub Releases。

GitHub Actions 会在 PR 阶段检查安装包并构建网站。维护者通过 `plugins-release-<数字>` 分支提交的常规发版，构建和文件检查通过后可以自动合并。新增插件和站点改动由维护者审核。发版细则见 [仓库规范](./AGENTS.md)。合并到 `main` 后会更新 GitHub Pages。
