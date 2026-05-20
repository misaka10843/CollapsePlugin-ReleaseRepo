# 简介

欢迎使用 **Collapse Launcher 插件库** —— 一套为 [Collapse Launcher](https://github.com/CollapseLauncher/Collapse) 提供更多游戏支持的第三方插件。

## 什么是插件？

Collapse Launcher 支持插件系统（插件标准 `v0.1.5.0+`），允许社区在不修改启动器核心的情况下添加游戏支持。

每个插件：

- 以 `.dll` 形式由 Collapse Launcher 在运行时加载
- 通过 `manifest.json` 声明版本和依赖
- 遵循 Collapse Plugin API 版本约定
