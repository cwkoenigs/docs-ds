The theme of the Data Science team's documentation portal: a Docusaurus shell (`docs-ds`) that renders every repository's docs and the canon's standards with one look. Navy and teal, serif headings over a sans body, square corners, rules instead of shadows. Use it for anything that should read as a page of the portal.

## Content fundamentals

- The shell authors nothing. Pages come from repositories and the canon as plain CommonMark; write for that: headings, lists, pipe tables and fenced code, no shell-specific markup.
- Titles and labels are sentence case: "Docs shell", "How `ds docs` uses it", "Team portal".
- Open a page with one lead sentence that says what it is; the shell sets a page's first paragraph in `lead` and `ifm-color-content-secondary`. Example: "This site renders whatever content tree it is pointed at."
- Name commands and paths in inline code: `ds docs serve`, `DOCS_CONTENT_PATH`.
- Plain, declarative sentences. No emoji, no exclamation marks.
- The site title is "Data Science"; the footer reads "Data Science Team"; the tagline is "Team knowledge, project context, and the ds-cli guide".

## Color

- Ground every page in `ifm-background-color`; raise pagination links, the mobile sidebar and the search modal on `ifm-background-surface-color`.
- Set text in `ifm-font-color-base` and secondary copy in `ifm-color-content-secondary`. Both read on `ifm-background-color` in both themes (secondary 5.0:1 light, 7.1:1 dark).
- Links are `ifm-link-color`, hovering to `ifm-link-hover-color`, underlined with a 0.2em offset.
- The navbar is navy in both themes: `ifm-navbar-background-color` with `ifm-navbar-link-color` text and `ifm-navbar-link-hover-color` on hover and for the active link.
- `ifm-color-primary` is an accent, not a text color: the navbar's bottom rule, the active sidebar link's left rule, the monogram's field. In light it reads only 2.6:1 on the ground, so never carry meaning with it alone; the active sidebar link also changes text to `ifm-menu-color-active` on `ifm-menu-color-background-active`.
- Sidebar links rest in `ifm-menu-color`.
- Code sits on `ifm-code-background`; a highlighted line uses `docusaurus-highlighted-code-line-bg`.
- Hairlines and dividers are `ifm-color-emphasis-200`; the table-of-contents rule is `ifm-toc-border-color` (same values).
- The footer is a literal in the stylesheet, not a token: `#001126` ground with `#c0cdd5` text in both themes.
- Dark mode follows the system preference (`respectPrefersColorScheme`) and keeps the navy navbar; the ground moves to `#0b1e2d` and the brand teal lightens to `#54cbc4`.

## Typography

- Headings and the navbar title are in the `heading` family (Georgia), weight 500, letter-spacing −0.035em: `h1` (3rem on desktop, `clamp(2.2rem, 4vw, 3rem)` in the source), `h2` (1.8rem, 2.25rem above), `h3` (1.4rem), `navbar-title` (1.5rem; 1.3rem under 996px).
- Prose is in the `base` family (Helvetica Neue): `body` 16px at line-height 1.7, `lead` 1.125rem for the first paragraph, `table` 1rem with left-aligned headers.
- Chrome text: `navbar-link` 1rem/500, `menu` 0.95rem with `menu-section` labels at 600, `toc` and `footer` at 0.875rem, `pagination-label` 1rem/500.
- Code is in the `monospace` family at `code` (90% of the surrounding size).
- All three families are system stacks; the theme ships no font files. Fall back as the stacks say: Arial, Times New Roman, Courier New.

## Spacing and layout

- The theme defines no spacing scale; it inherits Infima's and overrides a few literals: sidebar padding 1.25rem 0.8rem, sidebar link padding 0.6rem top and bottom, footer padding 1.4rem, `h2` margin-top 2.25rem, content padding-top 0.75rem (2rem on the container) on desktop, 1rem below the article.
- The navbar is `ifm-navbar-height` (4.25rem) tall; the docs sidebar is `doc-sidebar-width` (280px) wide and hideable.
- The layout breaks at 996px: smaller headings, horizontally scrolling tables, the sidebar folded into the navbar.

## Radii, borders and shadows

- Every corner is square: all nine radius tokens (`ifm-global-radius` through `ifm-tabs-border-radius`) are `0`, and the menu, pagination, dropdowns, search input, `kbd` and the back-to-top button are zeroed explicitly. Do not round anything.
- Edges are drawn with 2px rules in `ifm-color-primary`: under the navbar, left of the active sidebar link. Underlines carry state: the active navbar link at 0.5em offset, prose links at 0.2em.
- No shadows on chrome (`ifm-navbar-shadow` is `none`); only the search modal casts `search-local-modal-shadow`.

## States and focus

- Focus is visible everywhere: a 2px solid outline in `ifm-link-color` with a 4px offset; inside the navbar the outline is `ifm-navbar-link-hover-color` so it shows on navy.
- Hover changes color only (links, navbar links, sidebar links); no motion is defined.
- Code blocks use Prism's GitHub theme in light and Dracula in dark.

## Iconography and marks

- There is no icon set; the shell uses Docusaurus's own glyphs (sidebar carets, color-mode toggle, search). Do not add emoji or an icon font.
- The one mark is `assets/Logos/ds-monogram.svg`: a 40×40 `ifm-color-primary` square with "ds" set in Georgia at 22px in the brand navy (`#021832`, 6.3:1 on the teal). It is the favicon and sits 34×34 in the navbar beside the title with a 0.4rem gap.

## Components

- `Navbar`, `SidebarMenu`, `Prose` and `Footer` are static renditions of the themed Docusaurus surfaces, hand-written from `src/css/custom.css`; the portal itself renders them with Docusaurus's components. Use them as a reference for how the tokens combine, not as a library.

## Not synced

- Route: read-only — the repository has no component library, so nothing was built; the four components are hand-written static previews from `src/css/custom.css`.
- Font files: none exist in the repository (system stacks only); `type.fonts` is empty.
- Spacing: no scale is defined in the source; the literal paddings and margins are listed above, not tokenized.
- `h1`'s `clamp(2.2rem, 4vw, 3rem)` is recorded as 3rem with the clamp noted.
- Literal colors that are not variables (footer `#001126` / `#c0cdd5`, the active navbar link `#77d8d2`, navbar toggle `#e3e9ea`) are described above, not tokenized.
- `search-local-hit-active-color` is declared only in dark in the source; the light theme borrows it here.
- Three `rgb(… / %)` values were written in `rgba()` form with the same value.
