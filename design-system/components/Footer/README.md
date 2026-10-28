The portal footer: one line of small muted text on a near-black navy band. Hand-written from `src/css/custom.css` as a static rendition; the portal renders it with Docusaurus's footer.

## When to use

At the bottom of every portal page, in both themes.

## What the consumer provides

- The copyright line (`Data Science Team`). Nothing else: no link columns, no logo.

## Rules

- Ground `ifm-footer-background-color` and text `ifm-footer-color` (11.7:1); the same in both themes. A link would be `ifm-footer-link-color`, hovering to `ifm-footer-link-hover-color`.
- Padding `space-footer` on every side, at every width; text `footer` (0.875rem).
- Square corners, no rule above, no shadow.
