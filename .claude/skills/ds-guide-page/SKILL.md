---
name: ds-guide-page
description: >
  Write or update a page in the ds-cli guide (getting started, user guide,
  templates, reference, developer, admin) from the ds-cli source of truth,
  never from memory of what the CLI might do.
when_to_use: >
  "Document the <command>", a ds-cli release changes commands or options, or a
  ds-docs-audit report lists a guide section as a stub.
---

# Writing a guide page

The guide describes the CLI as it is in the repository you can read. If the
ds-cli repository is not available, stop; a guide page written from memory is
worse than the stub it replaces.

## Procedure

1. Follow `ds-docs-locate` for the docs. Locate ds-cli the same way:
   `$DS_CLI_PATH`, then `../ds-cli`, else ask.
2. Take command names, options, defaults, and help text from the code, not the
   README. For a Typer app that means the `@app.command` decorators and the
   `typer.Option` / `typer.Argument` declarations. Record the version from
   `pyproject.toml` and put it in the page's `doc-metadata` comment.
3. Pick the section:

   | Section | Answers |
   | --- | --- |
   | `getting-started/` | How do I install it and do the first thing? |
   | `user-guide/` | How do I do my everyday task? One page per task. |
   | `project-templates/` | What does each template give me? |
   | `reference/` | What are all the commands, options, and settings? Tables. |
   | `developer/` | How do I change ds-cli itself? |
   | `admin/` | How is it released, deployed, and operated? |

4. Write the page with `title` and `sidebar_position` in frontmatter and a
   one-line `description`. Lead with what the reader is trying to do. Command
   examples show variables, not values, and placeholder hosts.
5. Replace the section's stub admonition when the section now has real
   content. Link the new page from the section `index.md`.
6. `npm run lint`, then `npm run validate` if you added links. Commit as
   `guide: <section>: <what>`.

## Keep reference and narrative apart

Reference pages are tables and are regenerated wholesale when the CLI changes.
User-guide pages are prose about a task and change only when the task changes.
Do not duplicate option tables into user-guide pages; link to the reference.
