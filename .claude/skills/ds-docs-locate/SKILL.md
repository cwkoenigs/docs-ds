---
name: ds-docs-locate
description: >
  Find the ds-docs checkout and load its writing conventions before any other
  ds-docs skill edits it. Used by the other ds-docs skills; run directly when
  unsure where the docs live.
---

# Locating the docs repository

Every ds-docs skill writes into the same checkout. Resolve it the same way each
time so pages never land in a stale clone.

## Resolve the path

Take the first that exists, in this order:

1. The current directory, if it contains `docusaurus.config.ts` and `docs/wiki/`.
2. `$DS_DOCS_PATH`.
3. `../ds-docs` relative to the current repository root.
4. A fresh shallow clone of `$DS_DOCS_REPO` into a temporary directory, only if
   that variable is set.

If none resolve, stop and ask for the path. Do not guess and do not create a
new docs tree somewhere else.

```bash
for d in "$PWD" "$DS_DOCS_PATH" "$(git rev-parse --show-toplevel 2>/dev/null)/../ds-docs"; do
  [ -n "$d" ] && [ -f "$d/docusaurus.config.ts" ] && [ -d "$d/docs/wiki" ] && echo "$d" && break
done
```

## Before writing

- Read `CLAUDE.md` in the docs repository. It holds the content rules.
- Check the working tree is clean (`git status --short`). If it is not, say so
  and continue only with files you are about to write; never discard someone
  else's edits.
- Confirm `docs-policy.local.json` exists when the content mentions the
  organization. Without it the lint cannot catch the company name. Ask for it
  to be created from `docs-policy.local.example.json` rather than proceeding.

## After writing

Run from the docs repository:

```bash
npm run lint
```

Fix every error the lint reports in the files you touched. Then run
`npm run validate` when you changed links, images, or more than a handful of
pages; it is the full build and catches what the lint cannot.

Commit with a message in the form `wiki: <what>` or `guide: <what>`. Push only
when asked or when `DS_DOCS_AUTOPUSH=1`.
