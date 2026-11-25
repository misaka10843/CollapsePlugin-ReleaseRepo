---
title: "Submit and Publish a Plugin"
description: "Prepare a Collapse Launcher plugin ZIP and manifest, add catalog metadata, and submit a pull request."
---

# Submit & Publish a Plugin

Have a Collapse Launcher plugin you'd like to share? Open a pull request against [CollapsePlugin-ReleaseRepo](https://github.com/misaka10843/CollapsePlugin-ReleaseRepo) and include:

- A link to the plugin's source repository
- The game and regions it supports
- The Collapse Launcher version you tested with

## Submission steps

1. **Pick a unique plugin ID**, such as `MyGame`. Use the exact same spelling and case in both the repository root directory and `site/plugins/`.
2. **Add the plugin files and ZIP**:
   - Place `manifest.json`, the main plugin `.dll`, and any required runtime files under `MyGame/`.
   - Place a single installable ZIP package in `MyGame/build/` named:
     ```text
     MyGame_<version>_API-<api-version>_<YYYYMMDD>.zip
     ```
3. **Configure site metadata** in `site/plugins/MyGame/meta.json`:
   - Set `repository` to the GitHub repository in `owner/name` format so the site can fetch its README and Releases.
   - Set `readmeRef` if the README lives on a branch other than `main`.
   - Set `releaseTagPrefix` if the repository publishes multiple plugins under different tag prefixes.
   - Optionally add fallback `README.md` / `README.zh-CN.md` files in the same directory.
4. **Create detail pages**:
   - Copy an existing pair of detail pages (`site/docs/plugins/arknights.mdx` and `site/docs/zh/plugins/arknights.mdx`), rename them to `mygame.mdx`, and update the `@data/...` import and `og:image` icon URL to match your plugin.
5. **Verify locally before opening the PR**:
   ```sh
   pnpm --dir site install --frozen-lockfile
   pnpm --dir site typecheck
   pnpm --dir site build
   ```
   Test installing the generated ZIP inside Collapse Launcher before submitting.

## Publishing updates

- Keep **exactly one** installable ZIP per plugin in `build/`.
- In a release PR, replace the previous ZIP, update `manifest.json` and the main DLL, and remove runtime files that are no longer needed.
- Store older packages and `.pdb` debug symbols in your plugin's GitHub Releases rather than committing them to the release repository.

GitHub Actions automatically validates package filenames and builds the site on every PR. New plugins and frontend changes go through manual review before merging to `main` and deploying to GitHub Pages.
