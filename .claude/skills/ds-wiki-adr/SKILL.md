---
name: ds-wiki-adr
description: >
  Write an architecture decision record in the wiki, or register one that lives
  in another repository in the cross-repo ADR index.
when_to_use: >
  "Write an ADR for this", a change introduces or replaces a technology,
  pattern, or process, or a source repository gains an ADR that the wiki should
  point to.
---

# Recording a decision

## Decide where it lives

- Team-wide decisions (tooling, conventions, platform choices) are written in
  the wiki at `docs/wiki/adr/`.
- Decisions scoped to one repository stay in that repository and get a row in
  `docs/wiki/adr-index.md`.

## Writing a wiki ADR

1. Follow `ds-docs-locate`.
2. Find the next number: `ls docs/wiki/adr/` and take the highest `NNN` plus
   one, zero-padded to three digits.
3. Copy `templates/adr.md` to `docs/wiki/adr/NNN-<slug>.md`. Title format is
   `ADR-NNN: <Decision>`; the lint checks it.
4. Fill Context, Decision, Alternatives considered, and Consequences. Write the
   alternatives honestly, including what was attractive about each. An ADR
   with no real alternatives is a note, not a decision.
5. `status` starts as `Proposed`. Change it to `Accepted` only when told the
   decision is made. When a later ADR replaces it, set `Superseded` and link
   the successor in References.
6. Add a row to the table in `docs/wiki/adr/index.md`:
   `| ADR-NNN | [<Decision>](NNN-<slug>.md) | <status> | <date> |`.

## Registering an external ADR

Append to the table in `docs/wiki/adr-index.md`, keeping the existing columns:

```markdown
| <project-name> | ADR-NNN | <Decision title> | <status> | <date> | [source](<repo URL>/-/blob/main/docs/adr/NNN-<slug>.md) |
```

Use a placeholder host when the repository host is internal. The project name
must match its wiki page file name.

## Finish

`npm run lint`, fix errors, commit as `wiki: adr: <NNN or project>: <decision>`.
