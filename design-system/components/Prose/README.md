A rendered docs page: serif heading, a muted lead paragraph, body copy with offset-underlined links, inline code on a tinted square ground. Hand-written from `src/css/custom.css` as a static rendition; the portal renders Markdown through Docusaurus's `.markdown` styles.

## When to use

For any page body. Pages are plain CommonMark from a repository or the canon; this is what that Markdown becomes.

## What the consumer provides

- The Markdown: one `h1`, sections under `h2`/`h3`, paragraphs, lists, pipe tables and fenced code.
- The first paragraph is the lead: write it as one sentence that says what the page is.

## Rules

- `h1` in `heading` at `clamp(h1-compact, h1-fluid-size, h1)` (2.2rem to 3rem), `h2` 1.8rem with `space-h2-above` above, `h3` 1.4rem; all weight 500, −0.035em.
- The first paragraph is `lead` in `ifm-color-content-secondary`; the rest is `body` in `ifm-font-color-base`.
- Links are `ifm-link-color`, underlined at `underline-offset-prose`, hovering to `ifm-link-hover-color`; focus is a `focus-ring-width` outline in `ifm-link-color` at `focus-ring-offset`.
- Inline code and blocks sit on `ifm-code-background` in `monospace` at `code` (90%), square corners; a highlighted line uses `docusaurus-highlighted-code-line-bg`.
- Tables are full width at `table` (1rem) with left-aligned headers and `ifm-color-emphasis-200` rules; below `breakpoint-mobile` they scroll horizontally.
- The article sits `space-content-top` below the navbar on desktop and keeps `space-article-bottom` below itself.
