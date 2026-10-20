The portal's top bar: navy ground, the monogram and serif site title on the left, navigation links and the search box on the right, closed by a 2px teal rule. Hand-written from `src/css/custom.css` as a static rendition; the portal renders it with Docusaurus's navbar.

## When to use

At the top of every portal page, in both themes — the bar stays navy (`ifm-navbar-background-color`) when the page goes dark.

## What the consumer provides

- The site title (`SITE_TITLE`, default "Data Science") and the monogram (`assets/Logos/ds-monogram.svg`, 34×34, 0.4rem gap).
- One or more links; mark the current one active.

## Rules

- Height `ifm-navbar-height` (4.25rem); bottom border 2px `ifm-color-primary`; no shadow (`ifm-navbar-shadow`).
- Title in `navbar-title` (Georgia 1.5rem/500, −0.035em); links in `navbar-link` (1rem/500), colored `ifm-navbar-link-color`, hover `ifm-navbar-link-hover-color`.
- The active link is `#77d8d2` with an underline at 0.5em offset — the state is the underline, not a background.
- Search input, `kbd` and dropdowns inside the bar are square (radius 0); the input is at least 2.25rem tall.
- Focus rings inside the bar use `ifm-navbar-link-hover-color` so they show on navy.
