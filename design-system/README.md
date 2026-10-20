The theme of the Data Science team's documentation portal: a Docusaurus shell (`docs-ds`) that renders every repository's docs and the canon's standards with one look. Navy and teal, serif headings over a sans body, square corners, rules instead of shadows. Use it for anything that should read as a page of the portal.

## Content fundamentals

- The shell authors nothing. Pages come from repositories and the canon as plain CommonMark; write for that: headings, lists, pipe tables and fenced code, no shell-specific markup.
- Titles and labels are sentence case: "Docs shell", "How `ds docs` uses it", "Team portal".
- Open a page with one lead sentence that says what it is; the shell sets a page's first paragraph in `lead` and `ifm-color-content-secondary`. Example: "This site renders whatever content tree it is pointed at."
- Name commands and paths in inline code: `ds docs serve`, `DOCS_CONTENT_PATH`.
- Plain, declarative sentences. No emoji, no exclamation marks.
- The site title is "Data Science"; the footer reads "Data Science Team"; the tagline is "Team knowledge, project context, and the ds-cli guide".

## Color

- Ground every page in `ifm-background-color`; raise pagination links and the mobile sidebar on `ifm-background-surface-color`, and the search dropdown on `search-local-modal-background` (the same values).
- Set text in `ifm-font-color-base` and secondary copy in `ifm-color-content-secondary`. Both read on `ifm-background-color` in both themes (secondary 5.0:1 light, 7.1:1 dark).
- Links are `ifm-link-color`, hovering to `ifm-link-hover-color`, underlined at `underline-offset-prose`.
- The navbar is navy in both themes: `ifm-navbar-background-color` with `ifm-navbar-link-color` for the title, links, menu toggle, color-mode button and the mobile sidebar's brand strip; `ifm-navbar-link-hover-color` on hover and for the active link (Infima colors both from it) and for focus rings inside the bar.
- The search field on the navbar is `ifm-navbar-search-input-background-color` (dark's ground, in both themes) with `ifm-navbar-search-input-color` for typed text and the magnifier and `ifm-navbar-search-input-placeholder-color` for the placeholder and keyboard hint; its focus outline is `search-local-input-active-border-color`.
- Search results are `search-local-hit-background` rows with `search-local-hit-color` text and `search-local-muted-color` paths; matches are `search-local-highlight-color`, which is also the focused row's ground under `search-local-hit-active-color`.
- `ifm-color-primary` is an accent, not a text color: the navbar's bottom rule, the active sidebar link's left rule, the monogram's field. In light it reads only 2.6:1 on the ground, so never carry meaning with it alone; the active sidebar link also changes text to `ifm-menu-color-active` on `ifm-menu-color-background-active`.
- Sidebar links rest in `ifm-menu-color`.
- Code sits on `ifm-code-background`; a highlighted line uses `docusaurus-highlighted-code-line-bg`.
- Hairlines and dividers are `ifm-color-emphasis-200`; the table-of-contents rule is `ifm-toc-border-color` (same values).
- The footer is `ifm-footer-background-color` (the dark navbar navy) with `ifm-footer-color` text in both themes; a footer link would be `ifm-footer-link-color`, hovering to `ifm-footer-link-hover-color`.
- Dark mode follows the system preference (`respectPrefersColorScheme`) and keeps the navy navbar; the ground moves to `#0b1e2d` and the brand teal lightens to `#54cbc4`.

## Typography

- Headings and the navbar title are in the `heading` family (Georgia), weight 500, letter-spacing −0.035em: `h1` (3rem), `h2` (1.8rem, `space-h2-above` above), `h3` (1.4rem), `navbar-title` (1.5rem). The page title is `clamp(h1-compact, h1-fluid-size, h1)`, so it shrinks with the viewport to `h1-compact` (2.2rem), its fixed size below `breakpoint-mobile`; the navbar title drops to `navbar-title-compact` (1.3rem) there.
- Prose is in the `base` family (Helvetica Neue): `body` 16px at line-height 1.7, `lead` 1.125rem for the first paragraph, `table` 1rem with left-aligned headers.
- Chrome text: `navbar-link` 1rem/500, `menu` 0.95rem with `menu-section` labels at 600, `toc` and `footer` at 0.875rem, `pagination-label` 1rem/500.
- Code is in the `monospace` family at `code` (90% of the surrounding size).
- All three families are system stacks; the theme ships no font files. Fall back as the stacks say: Arial, Times New Roman, Courier New.
- In the shell every style is also a set of custom properties (`--type-<style>-size`, `-weight`, `-leading`, `-tracking`); that is how the stylesheet refers to a size or weight.

## Spacing and layout

- The theme inherits Infima's spacing scale and defines its own few distances as `spacing` tokens: sidebar padding `space-menu-y` and `space-menu-x`, each sidebar link's `ifm-menu-link-padding-vertical`, the monogram's `space-brand-gap`, footer padding `space-footer`, `space-h2-above`, and on desktop `space-content-top` above the article and `space-container-top` above its container, with `space-article-bottom` below.
- The navbar is `ifm-navbar-height` tall with the monogram at `navbar-logo-size`; the search field is at least `navbar-search-input-min-height` tall; the docs sidebar is `doc-sidebar-width` wide and hideable.
- The layout breaks at `breakpoint-mobile` (996px): compact headings, horizontally scrolling tables, the sidebar folded into the navbar. It is Docusaurus's own breakpoint and the one value the stylesheet repeats as a literal, inside its media queries.

## Radii, borders and shadows

- Every corner is square: all nine radius tokens (`ifm-global-radius` through `ifm-tabs-border-radius`) are `0`, and the shell applies `ifm-global-radius` explicitly to the menu, dropdowns, search field, `kbd` and back-to-top button that Infima rounds on its own. Do not round anything.
- Edges are drawn with `rule-width` rules in `ifm-color-primary`: under the navbar, left of the active sidebar link (a resting link carries a transparent rule of the same width, so nothing shifts). Underlines carry state: the active navbar link at `underline-offset-navbar`, prose links at `underline-offset-prose`.
- No shadows on chrome (`ifm-navbar-shadow` is `none`); only the search dropdown casts `search-local-modal-shadow`.

## States and focus

- Focus is visible everywhere: a `focus-ring-width` solid outline at `focus-ring-offset`, in `ifm-link-color` on the page and `ifm-navbar-link-hover-color` inside the navbar; the search field's own outline is `search-local-input-active-border-color`, the same color.
- Hover changes color only (links, navbar links, sidebar links); no motion is defined.
- Code blocks use Prism's GitHub theme in light and Dracula in dark.
- Every text-on-ground pair named above reads at 4.5:1 or better in both themes, and the rules on navy at 3:1; the shell's `npm run check:theme` verifies the pairs on every change.

## Iconography and marks

- There is no icon set; the shell uses Docusaurus's own glyphs (sidebar carets, color-mode toggle, search). Do not add emoji or an icon font.
- The one mark is `assets/Logos/ds-monogram.svg`: a 40×40 `ifm-color-primary` square with "ds" set in Georgia at 22px in the brand navy (`#021832`, 6.3:1 on the teal). It is the favicon and sits at `navbar-logo-size` in the navbar beside the title, `space-brand-gap` from it. The shell copies it from here into `static/img/`.

## Components

- `Navbar`, `SidebarMenu`, `Prose` and `Footer` are static renditions of the themed Docusaurus surfaces, hand-written from `src/css/custom.css`; the portal itself renders them with Docusaurus's components. Use them as a reference for how the tokens combine, not as a library.

## How the shell uses this

- `scripts/build-theme.mjs` turns `tokens.json` into `src/css/tokens.css` (every token a custom property; the first theme on `:root`, dark on `[data-theme='dark']`; `{alias}` values as `var()`) and copies the marks to `static/img/`. It runs before every start and build.
- `src/css/custom.css` holds selectors only and names a token for every value. `docusaurus.config.ts` reads `navbar-logo-size` for the logo and renders the footer without Infima's dark variant so the `ifm-footer-*` tokens apply.
- `scripts/check-theme.mjs` fails the build on a literal in the stylesheet, a stale generated file, a malformed token, an alias that does not resolve, or a contrast pair below its minimum.

## Not synced

- Route: read-only — the repository has no component library; the four components are hand-written static previews of what `src/css/custom.css` makes of Docusaurus's own components.
- Font files: none exist in the repository (system stacks only); `type.fonts` is empty.
- `breakpoint-mobile` is a layout token for reference; the stylesheet's media queries repeat it as a literal because CSS cannot read a custom property there.
- The page title's `clamp()` is composed in the stylesheet from `h1-compact`, `h1-fluid-size` and `h1`; no single token holds it.
- The hairline `ifm-color-emphasis-200` is decorative (1.2:1 on the light ground) and is not held to a contrast minimum.
