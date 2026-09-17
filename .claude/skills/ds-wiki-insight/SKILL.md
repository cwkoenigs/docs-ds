---
name: ds-wiki-insight
description: >
  Turn a finding from an analysis, experiment, or incident into an insight page
  in the team wiki, written so the conclusion survives without the author.
when_to_use: >
  "Write this up as an insight", after an analysis reaches a conclusion the
  team should reuse, or after a post-incident review.
---

# Writing an insight

An insight is a claim plus the evidence for it. Readers should be able to
disagree with it from the page alone.

## Procedure

1. Follow `ds-docs-locate`.
2. State the finding in one sentence. If you cannot, the analysis is not done;
   say so instead of writing a vague page.
3. Copy `templates/insight.md` to `docs/wiki/insights/<slug>.md`. The slug is
   the finding in three to six lowercase words joined by hyphens, for example
   `feature-store-cuts-scoring-time`.
4. Fill each section. Evidence uses summary numbers and small tables. Never
   paste rows with member, customer, or account identifiers, and never paste
   query output containing internal object names that would identify the
   organization.
5. Link the project pages the insight concerns in `projects` frontmatter and in
   the Recommendation section. Add a reciprocal link under "Related" on each of
   those project pages.
6. Add a row to `docs/wiki/insights/index.md`:
   `| <date> | [<title>](<slug>.md) | <one-line description> |`.
7. Run `npm run lint`, fix errors, commit as `wiki: insight: <slug>`.

## Frontmatter the lint requires

`title`, `description`, `date` (YYYY-MM-DD). `tags` and `projects` are
recommended.

## If a decision follows

When the insight leads to a decision about architecture or process, write the
ADR with `ds-wiki-adr` and link the two pages to each other rather than putting
the decision inside the insight.
