---
name: ds-wiki-change
description: >
  Record a change from another repository in the team wiki: a dated changelog
  entry, an update to the project's page when behavior or setup changed, and
  ADR registry rows for new decisions. The successor to the ds-changes skill.
when_to_use: >
  After merging or releasing work in a team repository, or when asked to
  "record this in the wiki" or "update the changelog".
---

# Recording a change

One change produces one changelog entry. The project page changes only when
the entry describes something a reader of that page would now find wrong.

## Procedure

### 1. Understand the change

From the source repository, take the comparison you were given (a merge
request, tag, or commit range). With none given, use the working tree and the
last commit.

```bash
git log --format='%h %cs %s' <range>
git diff --stat <range>
```

Write one sentence a teammate can act on: what is different and what it means
for them. Not the list of files. Examples of the right altitude:

- "Batch scoring now reads features from the Feature Store instead of the
  staging table; rerun `ds deploy all` to pick up the new image."
- "Added a `--dry-run` flag to the monthly refresh job."

### 2. Locate the docs

Follow `ds-docs-locate`.

### 3. Add the changelog entry

`docs/wiki/changelog.md` is ordered newest first with one `## YYYY-MM-DD`
heading per day. Insert under today's heading, creating it at the top of the
list if absent. Use `templates/changelog-entry.md`:

```markdown
- **<project-name>** <sentence> ([<short ref>](<merge request URL>))
```

The bold name must match the project page file name so readers can find it.
Link the merge request or tag with a placeholder host if the real host is
internal.

### 4. Update the project page if needed

Open `docs/wiki/projects/<project-name>.md`.

- No page: run `ds-wiki-project` to create it, then continue.
- Page exists: change only the sections the change invalidates (usually "How
  it works" or "Run it"). Set `last_reviewed` to today. Leave everything else.

### 5. Register decisions

If the change adds or modifies an ADR in the source repository, add or update
its row in `docs/wiki/adr-index.md` with `ds-wiki-adr`.

### 6. Verify and commit

```bash
npm run lint
git add docs/wiki
git commit -m "wiki: <project-name>: <sentence>"
```

Push only when asked or when `DS_DOCS_AUTOPUSH=1`.

## Keep it small

If a change touches many projects, write one entry per project. If it is
purely internal (refactor, formatting, dependency bumps with no behavior
change), skip the changelog entirely and say so.
