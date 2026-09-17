import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Keep the existing /docs URL; use SITE_BASE_URL=/ for a dedicated SPCS host.
const basePath = process.env.SITE_BASE_URL ?? '/docs/';
if (!basePath.startsWith('/') || !basePath.endsWith('/') || /[?#]/.test(basePath)) {
  throw new Error('SITE_BASE_URL must start and end with / (for example /docs/ or /).');
}

const config: Config = {
  title: 'Data Science',
  tagline: 'Team knowledge, project context, and the ds-cli guide',
  favicon: 'img/ds-monogram.svg',
  url: process.env.SITE_URL ?? 'https://analytics.example.com',
  baseUrl: basePath,
  trailingSlash: true,
  future: {v4: true},
  onBrokenLinks: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  markdown: {
    format: 'detect',
    hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'},
  },
  presets: [
    ['classic', {
      docs: {
        path: process.env.DOCS_CONTENT_PATH ?? 'docs',
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
      theme: {customCss: './src/css/custom.css'},
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
      docsDir: process.env.DOCS_CONTENT_PATH ?? 'docs',
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
      title: 'Data Science',
      logo: {alt: '', src: 'img/ds-monogram.svg', width: 34, height: 34},
      items: [
        {type: 'docSidebar', sidebarId: 'wikiSidebar', position: 'left', label: 'Wiki'},
        {type: 'docSidebar', sidebarId: 'guideSidebar', position: 'left', label: 'Guide'},
      ],
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
