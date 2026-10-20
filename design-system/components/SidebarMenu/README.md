The docs sidebar: a 280px column of links whose active item gets a teal left rule, teal text and a tinted ground. Hand-written from `src/css/custom.css` as a static rendition; the portal renders it with Docusaurus's menu.

## When to use

Left of the article on every docs page above `breakpoint-mobile`; it folds into the navbar below that. The sidebar is hideable.

## What the consumer provides

- The tree of links; sections come from `_category_.json` files the staging step writes and open expanded by default.
- Which link is current.

## Rules

- Width `doc-sidebar-width`; padding `space-menu-y` `space-menu-x`; text `menu` (0.95rem) in `ifm-menu-color`.
- Section labels are `menu-section` (weight 600); no rounded corners on sections, carets or links (`ifm-global-radius`).
- Each link has `ifm-menu-link-padding-vertical` padding top and bottom and a transparent left border of `rule-width`.
- The active link: left border `ifm-color-primary`, text `ifm-menu-color-active`, ground `ifm-menu-color-background-active`. Keep all three — the rule alone is 2.6:1 on the light ground.
- Focus: a `focus-ring-width` outline in `ifm-link-color` at `focus-ring-offset`.
