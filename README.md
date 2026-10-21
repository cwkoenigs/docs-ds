# docs-ds

The docs shell: the Docusaurus renderer behind ds-next's `/docs` and the team portal. It has no
content of its own. `/docs` stages a content tree, repository docs with pointers resolved plus
the canon's standards as pages, and points this shell at it.

## Install and update

Requires Node.js 26 and npm. The canon's `install.sh` clones this beside canon and ds-next and
its `bootstrap.sh` runs `npm ci` here; rerunning either pulls and reinstalls. By hand:
`git pull && npm ci`. Nothing else needs doing when this repository changes.

## Run

```bash
npm ci
npm start            # the empty shell at http://localhost:3333/docs/
npm run validate     # typecheck, build, and build checks
```

## How `ds docs` uses it

| Variable | Set by `ds docs` to | Purpose |
| --- | --- | --- |
| `DOCS_CONTENT_PATH` | the staged tree | Content source |
| `SITE_TITLE`, `SITE_NAV_LABEL` | repo name or "Team portal" | Title and navbar label |
| `SITE_BASE_URL` | `/` | URL prefix (the shell's own default is `/docs/`) |
| `DOCS_STRICT` | `0` | Broken links warn instead of failing; `ds reconcile` owns that check |
| `DOCS_STATIC_PATH` | the stage's static dir | Extra static files, such as the adoption CSV |

The shell is found by `ds` at `$DS_DOCS_SHELL`, then `~/code/docs-ds`, then `~/Developer/docs-ds`.

## Theme

Every theme value — colors for both modes, font stacks, radii, shadows, navbar height and sidebar
width — lives in [`design-system/tokens.json`](design-system/tokens.json). `npm run theme` (run
automatically before `start` and `build`) generates `src/css/tokens.css` from it;
`src/css/custom.css` holds only rules. To change a color, edit `tokens.json`, not the CSS.

The same files are published as the team's [Data Science design system](https://claude.ai/artifact/2a3YywNAq2HiWpF9pPeWJB)
(brand book, token tables, component previews). `design-system/README.md` is that brand book;
`design-system/components/` are static previews of the themed chrome. Ask Claude to sync in either
direction — "sync the design system from docs-ds" after a change here, or "pull the design system
into docs-ds" after an edit on the page — and review the resulting PR.

## Hosting

The portal is built by the canon's pipeline with `ds docs portal` and served as static files.
[Dockerfile](Dockerfile) packages a build with nginx on port 8080; [deploy/](deploy/) has nginx
fragments for an existing host. See the canon repository for the pipeline.

## History

This repository began as a team wiki with skills that wrote pages into it. That model was
replaced on 2026-10-14 by the knowledge system: documentation lives in every repository,
standards live once in the canon, and this shell only renders. The wiki content, templates,
sync and lint scripts, and skills were removed in that change.
