# docs-ds

The docs shell: a Docusaurus site with no content of its own. `ds docs` (in ds-cli) stages a
content tree and points this shell at it; the shell renders it. One instance serves every
repository and the team portal. Nothing is authored here.

## What is here

| Path | Purpose |
| --- | --- |
| `docusaurus.config.ts` | Reads `DOCS_CONTENT_PATH`, `SITE_TITLE`, `SITE_NAV_LABEL`, `SITE_BASE_URL`, `SITE_URL`, `DOCS_STRICT`, `DOCS_STATIC_PATH` |
| `sidebars.ts` | One sidebar generated from the content tree; grouping from `_category_.json` files the staging step writes |
| `design-system/tokens.json` | Every theme value (colors per mode, fonts, radii, shadows, layout); the same file the team's Design System artifact holds |
| `scripts/build-theme.mjs` | Generates `src/css/tokens.css` from `tokens.json`; runs before `start` and `build` (`npm run theme`) |
| `src/css/custom.css` | Theme rules only (selectors, layout, media queries); no values |
| `design-system/` | Brand book (`README.md`) and static component previews mirrored from the Design System artifact |
| `scripts/check-build.mjs` | Post-build checks: landing page, sidebar, assets under the base URL, search index |
| `docs/index.md` | The only page of the empty shell, so it builds standalone |
| `Dockerfile`, `deploy/` | Static-site container and nginx fragments for hosting a built portal |

## Rules

1. **No content here.** Repository docs live in repositories; standards live in the canon.
   A page added to `docs/` here is a bug.
2. **Strictness belongs to `ds reconcile`.** A staged build runs with `DOCS_STRICT=0`; the shell's
   own build keeps `throw` so a broken shell is caught.
3. **Plain CommonMark in, nothing shell-specific required.** The staging step may use front
   matter and `_category_.json` because staged files are generated; repository docs never need to.
4. **Every change ends with `npm run validate`.** Commit as `shell: ...`.
5. **Theme values come from `design-system/tokens.json`.** Never put a color, font, radius or
   shadow value in `custom.css`; edit `tokens.json`, run `npm run theme`, commit the regenerated
   `src/css/tokens.css` with it.

## Commands

```bash
npm start                                  # the empty shell, http://localhost:3333/docs/
DOCS_CONTENT_PATH=/path/to/stage/docs SITE_BASE_URL=/ npm run build   # what ds docs does
npm run validate                           # typecheck + build + build checks
```
