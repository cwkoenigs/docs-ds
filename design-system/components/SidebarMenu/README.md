The docs sidebar: a 280px column of links whose active item gets a 2px teal left rule, teal text and a tinted ground. Hand-written from `src/css/custom.css` as a static rendition; the portal renders it with Docusaurus's menu.

## When to use

Left of the article on every docs page at 997px and up; it folds into the navbar below that. The sidebar is hideable.

## What the consumer provides

- The tree of links; sections come from `_category_.json` files the staging step writes and open expanded by default.
- Which link is current.

## Rules

- Width `doc-sidebar-width` (280px); padding 1.25rem 0.8rem; text `menu` (0.95rem) in `ifm-menu-color`.
- Section labels are `menu-section` (weight 600); no rounded corners on sections, carets or links.
- Each link has 0.6rem padding top and bottom and a 2px transparent left border.
- The active link: left border `ifm-color-primary`, text `ifm-menu-color-active`, ground `ifm-menu-color-background-active`. Keep all three — the rule alone is 2.6:1 on the light ground.
