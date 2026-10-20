# Logos

- `ds-monogram.svg` — the only mark: a 40×40 square in `ifm-color-primary` (`#00aba5`, literal in the file) with "ds" in Georgia 22px, filled with the brand navy `#021832`. Its colors are literal, so it looks the same in both themes. Used as the favicon and at `navbar-logo-size` (34px) in the navbar, `space-brand-gap` from the title; never recolor, stretch or round it. This file is the source: the shell's `npm run theme` copies it to `static/img/ds-monogram.svg`, and `npm run check:theme` confirms the copy and that its fills are the light theme's primary and navy.
