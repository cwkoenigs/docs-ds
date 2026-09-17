import assert from 'node:assert/strict';
import {access, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'build');
const {default: config} = await import('../.docusaurus/docusaurus.config.mjs');
const globalData = JSON.parse(await readFile(path.join(root, '.docusaurus/globalData.json'), 'utf8'));
const version = globalData['docusaurus-plugin-content-docs'].default.versions[0];
const baseUrl = config.baseUrl;

assert(version.docs.some((doc) => doc.path === baseUrl), 'The documentation landing page is missing.');
for (const sidebar of ['wikiSidebar', 'guideSidebar']) {
  assert(version.sidebars[sidebar]?.link, `Missing ${sidebar} navigation.`);
}

const assets = new Set();
for (const doc of version.docs) {
  assert(doc.path.startsWith(baseUrl), `Route is outside ${baseUrl}: ${doc.path}`);
  const relativeRoute = doc.path.slice(baseUrl.length);
  const html = await readFile(path.join(output, relativeRoute, 'index.html'), 'utf8');
  assert(/<h1[\s>]/.test(html), `No rendered heading at ${doc.path}`);

  // Production minification can remove attribute quotes. Check actual emitted
  // resource URLs, including the base prefix, rather than source-file imports.
  for (const tag of html.matchAll(/<(?:script|link|img|source)\b[^>]*>/g)) {
    const attribute = tag[0].match(/\b(?:src|href)=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/);
    const resource = attribute?.[1] ?? attribute?.[2] ?? attribute?.[3];
    if (!resource?.startsWith('/') || resource.startsWith('//')) continue;
    const pathname = new URL(resource, config.url).pathname;
    assert(pathname.startsWith(baseUrl), `Resource bypasses ${baseUrl}: ${resource}`);
    assets.add(decodeURIComponent(pathname.slice(baseUrl.length)));
  }
}
for (const asset of assets) await access(path.join(output, asset));
await access(path.join(output, '404.html'));

const files = await readdir(output);
const searchFile = files.find((file) => /^search-index-.*\.json$/.test(file));
assert(searchFile, 'The local search index was not generated.');
const search = JSON.parse(await readFile(path.join(output, searchFile), 'utf8'));
const records = search.flatMap((section) => section.documents);
assert(records.length > 0, 'Local search has no documents. Check noindex and route-base settings.');
const searchPaths = records.map((record) => record.u).filter(Boolean);
for (const section of ['wiki/', 'guide/']) {
  assert(searchPaths.some((url) => url.startsWith(`${baseUrl}${section}`)), `Search is missing ${section}`);
}

console.log(`Verified ${version.docs.length} documentation routes, ${assets.size} local assets, and ${records.length} search records at ${baseUrl}.`);
