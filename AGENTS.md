# Repository guidelines

## Layout

- Keep the site and published plugin files on `main`. A plugin's root directory contains its manifest, runtime files and one current ZIP in `build/`.
- Keep site code in `site/`, plugin metadata and fallback READMEs in `site/plugins/<PluginId>/`, and site pages in `site/docs/`.
- Regenerate `site/.generated/` and `site/doc_build/` locally. Keep those files out of commits.

## Frontend

- Use Node.js 22 and pnpm 10. Run `pnpm --dir site install --frozen-lockfile` to install dependencies and `pnpm --dir site dev` to work on the site.
- Build on the existing Rspress pages, React components, and CSS theme variables. Keep plugin metadata types shared and imports narrow. Home and catalog pages should use the summary data. Load README and release notes only on the relevant detail page.
- Keep English and Simplified Chinese navigation, pages, and UI labels in sync. Preserve existing routes and plugin download URLs when editing a page.
- Check desktop and mobile layouts for UI changes. Keep the detail download panel in the right column on desktop and ahead of the content on mobile. Keep the manual download sources available, with labeled controls and visible keyboard focus.
- Fetch repository content during the build. Pass upstream Markdown through the existing sanitizer before rendering HTML. Keep mirror probes small and use the build's local ZIP during development.
- Before committing changes to the site, run `pnpm --dir site typecheck` and `pnpm --dir site build`. For interactive changes, verify the affected flow in a browser.

## Plugin releases and review

- A release PR updates the plugin manifest and main DLL and replaces the ZIP with `<PluginId>_<version>_API-<api-version>_<YYYYMMDD>.zip`. Include changes under `Lib/` when needed by the release. Store old packages and PDBs in GitHub Releases if they are needed.
- The automatic merge workflow handles successful builds for release PRs from the repository owner, on same-repository branches named `plugins-release-<number>`. It checks the current PR SHA and every changed path against the plugins registered on the validated `main`.
- Review new plugins, forks, frontend changes, documentation, and workflow changes manually. Add the `manual-review` label before a release build completes when a routine release needs a human review. Repository protection rules still apply.

## Commits

- Use Conventional Commits with a short imperative subject, such as `fix(site): align the package download panel`, `chore(release): update Endfield packages`, or `ci(release): verify release PR paths`.
- Keep routine package releases separate from frontend, workflow, and documentation changes. When one change requires another to build or run, commit them together.
- Review the staged diff before committing. Keep unrelated changes, generated files, credentials, and local configuration out of the commit.
