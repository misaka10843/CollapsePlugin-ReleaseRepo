# Collapse Launcher Plugins

**English** · [简体中文](./README.zh-CN.md)

This repository hosts third-party plugins for Collapse Launcher. Browse the [plugin catalog](https://cl-plugins.sakurakoi.top/plugins/) to find a plugin and download its ZIP.

## 🧩 Install a plugin

1. Download the ZIP from the plugin's page.
2. In Collapse Launcher, open **Settings → Open Plugin Management Menu**.
3. Click **Click to add .zip or manifest.json**, select the ZIP, and restart the launcher.

See the [installation guide](./site/docs/guide/installation.md) for screenshots.

## 🛠️ Run the site locally

Use Node.js 22 and pnpm 10. From the repository root, run:

```sh
pnpm --dir site install --frozen-lockfile
pnpm --dir site dev
```

Open the URL printed by Rspress. The dev command generates the catalog from local plugin files before starting the server. Restart it after replacing a manifest or ZIP. During development, the main download button uses the local ZIP so you can test the package you just built.

To skip old package versions when cloning, use `git clone --depth 1 --single-branch --branch main https://github.com/misaka10843/CollapsePlugin-ReleaseRepo.git`.

## 🤝 Submit your plugin

Have a Collapse Launcher plugin you'd like to share? Open a pull request and include a link to the source repository, the game and regions it supports, and the launcher version you tested.

1. Pick a unique plugin ID, such as `MyGame`. Use the same spelling and case in both directories.
2. In `MyGame/`, add `manifest.json`, the plugin DLL and any runtime files it needs. Put the installable ZIP in `MyGame/build/` and name it `MyGame_<version>_API-<api-version>_<YYYYMMDD>.zip`.
3. In `site/plugins/MyGame/meta.json`, set `repository` to the GitHub repository in `owner/name` form. The site reads its README and Releases. Set `readmeRef` if the README lives on a branch other than `main`. If the repository publishes several plugins, set `releaseTagPrefix` to the prefix for this plugin. Add local README files in the same directory if you want a fallback.
4. Copy an existing pair of [English](./site/docs/plugins/arknights.mdx) and [Chinese](./site/docs/zh/plugins/arknights.mdx) detail pages. Name them `mygame.mdx` and update the catalog data import and icon URL to match your plugin.
5. Run `pnpm --dir site build` and test the ZIP in Collapse Launcher before opening the PR.

## Publishing

Keep one installable ZIP per plugin in `build/`. In a release PR, replace the previous ZIP, update the manifest and DLL, and remove any runtime files the new release no longer uses. If you publish debug symbols or keep older ZIPs available, attach them to the plugin's GitHub Releases.

GitHub Actions checks PRs for duplicate or missing ZIPs and builds the site. Routine releases from the maintainer's `plugins-release-<number>` branches can merge after a successful build and a file check. New plugins and site changes go through manual review. See [repository guidelines](./AGENTS.md) for the release rules. Merging to `main` updates GitHub Pages.
