---
title: "提交和发布插件"
description: "准备 Collapse Launcher 插件安装包和清单，填写插件目录信息，并提交 Pull Request。"
---

# 发布插件

如果你开发了自己的 Collapse Launcher 插件并希望分享给更多玩家，欢迎向 [CollapsePlugin-ReleaseRepo](https://github.com/misaka10843/CollapsePlugin-ReleaseRepo) 提交 Pull Request。请在 PR 描述中附上：

- 插件的源码仓库链接
- 支持的游戏与区服列表
- 本地测试所使用的 Collapse Launcher 版本

## 提交步骤

1. **确定唯一的插件 ID**，例如 `MyGame`。仓库根目录与 `site/plugins/` 下的目录名请保持拼写与大小写完全一致。
2. **准备插件文件与安装包**：
   - 在 `MyGame/` 目录下放入 `manifest.json`、主插件 `.dll` 及运行所需的依赖文件（如 `Lib/`）。
   - 在 `MyGame/build/` 下放入唯一一个可直接安装的 ZIP 压缩包，命名格式为：
     ```text
     MyGame_<版本>_API-<API版本>_<YYYYMMDD>.zip
     ```
3. **配置站点元数据**（`site/plugins/MyGame/meta.json`）：
   - 将 `repository` 填写为 GitHub 仓库的 `owner/name`，站点在构建时会自动拉取对应的 README 与 Releases。
   - 若 README 位于非 `main` 分支，可设置 `readmeRef`。
   - 若同一仓库发布多个插件，可通过 `releaseTagPrefix` 指定当前插件对应的标签前缀。
   - 可在同一目录下放置本地 `README.md` 与 `README.zh-CN.md` 作为上游读取失败时的回退文档。
4. **添加插件详情页**：
   - 复制现有的英文与中文详情页（`site/docs/plugins/arknights.mdx` 与 `site/docs/zh/plugins/arknights.mdx`），重命名为 `mygame.mdx`，并将数据导入路径和图标 URL 替换为你的插件。
5. **本地构建与测试**：
   ```sh
   pnpm --dir site install --frozen-lockfile
   pnpm --dir site typecheck
   pnpm --dir site build
   ```
   提交 PR 前，请先在 Collapse Launcher 中实际导入该 ZIP 包确认安装和启动正常。

## 后续发版规范

- 每个插件的 `build/` 目录下只保留**一个**当前版本的 ZIP 安装包。
- 发版 PR 中请直接用新 ZIP 替换旧包，同时更新 `manifest.json`、主库 DLL，并清理不再需要的旧运行时文件。
- 如需保留历史安装包或 `.pdb` 调试符号，请发布到插件自身的 GitHub Releases 中。

GitHub Actions 会在 PR 阶段自动校验安装包结构并构建站点。新增插件与站点改动由维护者人工审核，合并到 `main` 后会自动更新 GitHub Pages。
