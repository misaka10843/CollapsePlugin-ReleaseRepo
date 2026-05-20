# Introduction

Welcome to **Collapse Launcher Plugins** — a collection of third-party plugins that extend [Collapse Launcher](https://github.com/CollapseLauncher/Collapse) with support for additional games.

## What are plugins?

Collapse Launcher supports a plugin system (Plugin Standard `v0.1.5.0+`) that allows the community to add game support without modifying the launcher core.

Each plugin:

- Ships as a `.dll` loaded by Collapse Launcher at runtime
- Declares its requirements in a `manifest.json`
- Follows the Collapse Plugin API versioning contract
