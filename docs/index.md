---
title: Docs shell
slug: /
description: This site renders whatever content tree it is pointed at.
hide_table_of_contents: true
custom_edit_url: null
---

This is the renderer behind `ds docs`. It has no content of its own: point it at a staged
tree with `DOCS_CONTENT_PATH` and it renders that tree with pointers resolved, standards as
pages, and local search.

- One repository: `ds docs serve` or `ds docs build` in that repository.
- Every repository: `ds docs portal <directory of checkouts>`.

Content lives in the repositories and in the canon; nothing is authored here.
