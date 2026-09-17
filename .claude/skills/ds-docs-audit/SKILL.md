---
name: ds-docs-audit
description: >
  Audit the docs site and keep it clean: run the lint and the build, then fix
  or report broken links, policy violations, stale or stub pages, orphans, and
  inconsistent frontmatter. Produces a short prioritized report.
when_to_use: >
  On a schedule, before a release of the docs, when asked "audit the docs" or
  "what is out of date", or after a batch of wiki writes from other skills.
---

# Auditing the docs

The audit has two halves: what the tools can see, and what only a reader can.
Do both, but never spend more time on the second than the first justifies.

## 1. Mechanical checks

From the docs repository (see `ds-docs-locate`):

```bash
[ -f sync.config.local.json ] && npm run sync    # refresh facts blocks, index, activity
npm run lint -- --json > /tmp/docs-lint.json; cat /tmp/docs-lint.json
npm run validate
```

The sync only runs where the repositories are checked out. Its output tells
you which registered repositories are missing on this machine; list them in
the report rather than guessing at their pages.

The lint reports three levels:

| Level | Meaning | Action |
| --- | --- | --- |
| `error` | Policy or structure violation | Fix in this run |
| `warn` | Stale page, marker, unlisted host, duplicate title | Fix if mechanical; otherwise list |
| `info` | Stub, thin page, orphan | List as backlog for the writing skills |

`npm run validate` fails on broken links and images and on a missing search
index. Fix those too.

## 2. Fix what is mechanical

Do these without asking:

- Forbidden content: replace with the placeholder convention (`example.com`,
  `<account>`, `[company]`), never with a different real value.
- Broken relative links: point at the right file or remove the link.
- Absolute `/docs/...` links: make them relative.
- Frontmatter: add missing fields with correct values where the page makes them
  obvious (a project page's `status` from its text, `last_reviewed` only if you
  actually reviewed it).
- Changelog ordering and entry format.
- Reciprocal `related` links between project pages.

Leave `last_reviewed` alone on pages you did not read in full.

## 3. Read for accuracy

For pages the lint flagged as stale, and for any page whose source repository
changed since `last_reviewed`, compare the page against the repository:

```bash
git -C <repo> log --since=<last_reviewed> --format='%cs %s'
```

If the page is still right, set `last_reviewed` to today. If it is wrong, run
`ds-wiki-project` for it rather than patching sentences.

## 4. Report

Finish with a report in this shape, in the reply or as
`docs/wiki/_audit-<YYYY-MM-DD>.md` when asked to keep it (underscore-prefixed
files are excluded from the site):

```markdown
## Docs audit <date>

Fixed: <count> errors, <count> warnings — <one line each>
Needs a writer: <page>: <why> (use ds-wiki-project / ds-wiki-insight / ds-wiki-adr)
Missing pages: <registered repositories with no project page, and pages still "Awaiting a writer">
Stubs remaining: <list>
Policy: <docs-policy.local.json present? yes/no>; sync config: <sync.config.local.json present? yes/no>
```

Commit fixes as `docs: audit <date>`. Push only when asked or when
`DS_DOCS_AUTOPUSH=1`.

## What the audit never does

- Rewrite prose for style.
- Delete a page because it is thin. Report it.
- Mark a page reviewed without reading it against its source.
