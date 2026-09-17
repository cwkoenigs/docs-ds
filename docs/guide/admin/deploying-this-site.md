---
title: Deploying this site
sidebar_position: 1
---

The site builds to static HTML in `build/`. Wiki and Guide pages are ordinary Markdown; `.mdx` files can opt into React components.

## Run locally

Use Node.js 22 and npm.

```bash
npm ci
npm start
```

Open <http://localhost:3333/docs/>. Development mode reloads when documentation or theme files change.

## Validate and preview search

```bash
npm run validate
npm run serve
```

Local search indexes the production build. Use this preview to search; the development server does not generate a search index. Search runs in the browser and does not require an external search service.

## Build configuration

Set these environment variables in the shell or CI before building. They are build-time settings; changing them requires rebuilding. Docusaurus does not automatically load an `.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `https://analytics.example.com` | Placeholder public origin; set this for deployment, without a path |
| `SITE_BASE_URL` | `/docs/` | URL prefix, beginning and ending with `/` |
| `DOCS_CONTENT_PATH` | `docs` | Local or sibling content directory |
| `DOCS_EDIT_URL` | Unset | Repository edit URL ending in `/`; enables edit links |

For a dedicated host with documentation at its root:

```bash
SITE_URL=https://docs.example.com SITE_BASE_URL=/ npm run validate
```

## Existing nginx host

The GitLab pipeline in this checkout validates the site and saves `build/` as an artifact. Replace `<docs-runner-tag>` in `.gitlab-ci.yml` with the tag of a shell runner that provides Node.js 22. The pipeline does not change the running server.

For the existing `/docs/` URL, copy the contents of `build/` into a `docs/` directory beneath nginx's chosen web root. The repository includes a location fragment in `deploy/nginx-existing.conf` using `/srv/www/docs-ds-public` as an example web root. Adapt that path to the server's release directory.

The resulting layout must look like this:

```text
docs-ds-public/
└── docs/
    ├── index.html
    ├── 404.html
    ├── assets/
    ├── guide/
    └── wiki/
```

Merge the fragment into the existing server block, validate it with `nginx -t`, and reload through the server's normal deployment procedure. Preserve the existing TLS, access controls, and non-docs routes.

Do not build directly into the live serving directory: publish a completed artifact using the team's release process. If the runner uses a persistent checkout, scope cleanup to build output.

## Container

The Dockerfile builds the site and serves it with unprivileged nginx on port 8080.

```bash
docker build -t docs-ds .
docker run --rm -p 8080:8080 docs-ds
```

Open <http://localhost:8080/docs/>. The health endpoint is `/healthz`. Deep links resolve to static pages and unknown routes return a real 404.

To build for a dedicated host, set both public URL arguments:

```bash
docker build \
  --build-arg SITE_URL=https://docs.example.com \
  --build-arg SITE_BASE_URL=/ \
  -t docs-ds .
```

## SPCS and Cortex Agent

The container is the static-site portion of the SPCS migration. Supply the target compute pool, image repository, service endpoint, and authentication settings for your environment; they are not configured in this checkout.

The Cortex chat widget is deferred until the authenticated SPCS integration is available. Configure the target agent as `<database>.<schema>.<agent-name>`. Adapt the chat agent package after its source and authentication contract are available.

Keep service credentials out of Docusaurus configuration, custom fields, and static JavaScript: those are browser-visible. Add the React widget through `src/theme/Root.tsx` once the server-side integration and user authentication are established.
