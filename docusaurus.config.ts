import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Keep the existing /docs URL; use SITE_BASE_URL=/ for a dedicated SPCS host.
const basePath = process.env.SITE_BASE_URL ?? '/docs/';
// The shell renders whatever content tree it is pointed at: the team site by default, or a
// staged tree from `ds docs` (one repo, or the portal). Strictness belongs to `reconcile --check`,
// so a staged build may downgrade broken links to warnings with DOCS_STRICT=0.
const contentPath = process.env.DOCS_CONTENT_PATH ?? 'docs';
const siteTitle = process.env.SITE_TITLE ?? 'Data Science';
const onBroken = process.env.DOCS_STRICT === '0' ? 'warn' : 'throw';
const staticDirs = ['static', ...(process.env.DOCS_STATIC_PATH ? [process.env.DOCS_STATIC_PATH] : [])];
if (!basePath.startsWith('/') || !basePath.endsWith('/') || /[?#]/.test(basePath)) {
  throw new Error('SITE_BASE_URL must start and end with / (for example /docs/ or /).');
}

const config: Config = {
  title: siteTitle,
  tagline: process.env.SITE_TAGLINE ?? 'Team knowledge, project context, and the ds-cli guide',
  favicon: 'img/ds-monogram.svg',
  url: process.env.SITE_URL ?? 'https://analytics.example.com',
  baseUrl: basePath,
  trailingSlash: true,
  future: {v4: true},
  onBrokenLinks: onBroken,
  onBrokenAnchors: onBroken,
  staticDirectories: staticDirs,
  i18n: {defaultLocale: 'en', locales: ['en']},
  markdown: {
    format: 'detect',
    hooks: {onBrokenMarkdownLinks: onBroken, onBrokenMarkdownImages: onBroken},
  },
  presets: [
    ['classic', {
      docs: {
        path: contentPath,
        routeBasePath: '/',
        sidebarPath: './sidebars.ts',
        // Only show edit links when the content's actual repository is configured.
        editUrl: process.env.DOCS_EDIT_URL || undefined,
        exclude: ['**/_*.{md,mdx}', '**/assets/**', '**/stylesheets/**'],
        sidebarCollapsed: false,
        breadcrumbs: true,
        // Project pages carry generated tags; no tags.yml registry is required.
        onInlineTags: 'ignore',
      },
      blog: false,
      // tokens.css is generated from design-system/tokens.json by `npm run theme` (runs before start and build).
      theme: {customCss: ['./src/css/tokens.css', './src/css/custom.css']},
    } satisfies Preset.Options],
  ],
  themes: [
    ['@easyops-cn/docusaurus-search-local', {
      hashed: 'filename',
      language: ['en'],
      indexDocs: true,
      indexBlog: false,
      indexPages: false,
      // The internal site is noindex for web crawlers, but still locally searchable.
      forceIgnoreNoIndex: true,
      docsDir: contentPath,
      docsRouteBasePath: '/',
      highlightSearchTermsOnTargetPage: true,
      explicitSearchResultPath: true,
    }],
  ],
  themeConfig: {
    metadata: [{name: 'robots', content: 'noindex, nofollow'}],
    colorMode: {respectPrefersColorScheme: true},
    docs: {sidebar: {hideable: true}},
    navbar: {
      title: siteTitle,
      logo: {alt: '', src: 'img/ds-monogram.svg', width: 34, height: 34},
      items: [{type: 'docSidebar', sidebarId: 'docs', position: 'left', label: process.env.SITE_NAV_LABEL ?? 'Docs'}],
    },
    footer: {
      style: 'dark',
      copyright: 'Data Science Team',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'sql', 'yaml', 'python', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
