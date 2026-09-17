# docs-ds

Docusaurus site for the Data Science team wiki and the ds-cli guide. The
content is written and maintained by skills, not by hand-copying from
repositories. This file is the contract every skill follows.

## What is here

| Path | Purpose |
| --- | --- |
| `docs/wiki/projects/<name>.md` | One page per team repository |
| `docs/wiki/changelog.md` | Dated entries, newest first |
| `docs/wiki/insights/<slug>.md` | Findings with evidence |
| `docs/wiki/adr/NNN-<slug>.md` | Team-wide decisions |
| `docs/wiki/adr-index.md` | Registry of decisions kept in other repositories |
| `docs/wiki/apps/` | Application catalog |
| `docs/guide/` | ds-cli documentation, hand-authored from the ds-cli source |
| `templates/` | Page skeletons the skills copy |
| `.claude/skills/` | The skills (see below) |
| `scripts/sync-projects.mjs` | Syncs facts from local checkouts: facts block per project page, project index table, changelog activity block |
| `scripts/lint-docs.mjs` | Structure and policy checks |
| `docs-policy.json` | Lint rules: required frontmatter, forbidden patterns, allowed link hosts |
| `docs-policy.local.json` | Untracked: company name and internal host patterns, plus redactions for the sync |
| `sync.config.json` | Sync defaults; the project list is empty here |
| `sync.config.local.json` | Untracked: the team's repositories to sync on this machine |

## Two writers, one page

The sync owns everything between `<!-- sync:...:start -->` and
`<!-- sync:...:end -->` markers and nothing else. Skills and people own the
rest. A new registered repository gets a page from the template with its
facts filled and an "Awaiting a writer" admonition; `ds-wiki-project` turns
that into a real page. The sync runs only where the repositories are checked
out, so CI builds whatever is committed.

## Skills

| Skill | Does |
| --- | --- |
| `ds-docs-locate` | Finds this checkout and the rules; the others call it first |
| `ds-wiki-project` | Creates or refreshes a project page from its repository |
| `ds-wiki-change` | Records a change: changelog entry, page update, ADR rows |
| `ds-wiki-insight` | Writes an insight page from a finding |
| `ds-wiki-adr` | Writes a wiki ADR or registers an external one |
| `ds-guide-page` | Writes a ds-cli guide page from the ds-cli source |
| `ds-docs-audit` | Lint, build, fix mechanical issues, report the rest |

Install them for use from other repositories with `scripts/install-skills.sh`.

## Rules

1. **Source of truth is a repository you can read.** Never write a project or
   guide page from memory of what a project probably does. Local directories
   are not necessarily the team's real repositories; confirm the remote.
2. **No identifying content.** No company name, internal hostnames, IPs,
   account locators, tokens, emails, or people's names. Use `example.com`,
   `<account>`, `<compute-pool>`, `[company]`, and team or role names. The lint
   catches what `docs-policy.json` and `docs-policy.local.json` describe; you
   are responsible for the rest.
3. **Plain Markdown.** `.md` pages are CommonMark. No raw HTML, no MDX unless a
   page genuinely needs a component.
4. **Frontmatter is a contract.** Project pages need `title`, `description`,
   `tags`, `related`, `status`, `last_reviewed`. Insights need `title`,
   `description`, `date`. ADRs need an `ADR-NNN:` title, `status`, `date`.
   `npm run lint` enforces this.
5. **Relative links only.** The site is served under a base path that can
   change.
6. **Stubs are honest.** A section without content keeps its
   `:::note[Awaiting ...]` admonition until real content replaces it. Never fill
   a stub with invented content to make it look complete.
7. **Every write ends with `npm run lint`.** Use `npm run validate` after link
   or image changes. Commit as `wiki: ...`, `guide: ...`, or `docs: ...`. Push
   only when asked or when `DS_DOCS_AUTOPUSH=1`.

## Commands

```bash
npm start            # dev server at http://localhost:3333/docs/
npm run sync         # refresh synced blocks from local checkouts (needs sync.config.local.json)
npm run sync:check   # exit 1 if synced blocks are stale
npm run lint         # structure and policy checks
npm run validate     # lint + typecheck + build + build checks
npm run serve        # preview the production build with search
```

## First-time setup on a machine with the repositories

```bash
cp docs-policy.local.example.json docs-policy.local.json   # add the company name and internal hosts
cp sync.config.local.example.json sync.config.local.json   # list the repositories
scripts/install-skills.sh --cortex                          # expose the skills to other repos
export DS_DOCS_PATH=$PWD
```
