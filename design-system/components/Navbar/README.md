The portal's top bar: navy ground, the monogram and serif site title on the left, navigation links and the search field on the right, closed by a teal rule. Hand-written from `src/css/custom.css` as a static rendition; the portal renders it with Docusaurus's navbar.

## When to use

At the top of every portal page, in both themes — the bar stays navy (`ifm-navbar-background-color`) when the page goes dark.

## What the consumer provides

- The site title (`SITE_TITLE`, default "Data Science") and the monogram (`assets/Logos/ds-monogram.svg`, at `navbar-logo-size`, `space-brand-gap` from the title).
- One or more links; mark the current one active.

## Rules

- Height `ifm-navbar-height`; bottom border `rule-width` in `ifm-color-primary`; no shadow (`ifm-navbar-shadow`).
- Title in `navbar-title` (Georgia 1.5rem/500, −0.035em; `navbar-title-compact` below `breakpoint-mobile`); links in `navbar-link` (1rem/500), colored `ifm-navbar-link-color`, hover `ifm-navbar-link-hover-color`.
- The active link is `ifm-navbar-link-hover-color` with an underline at `underline-offset-navbar` — the state is the underline, not a background.
- The search field is `ifm-navbar-search-input-background-color` with `ifm-navbar-search-input-color` text and `ifm-navbar-search-input-placeholder-color` placeholder and hint, at least `navbar-search-input-min-height` tall; it, `kbd` and the dropdown are square (`ifm-global-radius`).
- Focus rings inside the bar use `ifm-navbar-link-hover-color` (the search field's is `search-local-input-active-border-color`, the same color) so they show on navy.
