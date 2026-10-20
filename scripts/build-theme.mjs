// Generates src/css/tokens.css from design-system/tokens.json.
//
// design-system/tokens.json is the one source for every theme value; it is the same file the
// team's Design System artifact holds, so a change made there and synced here (or here and synced
// there) reaches the site on the next build. Rules that are not values (layout, selectors, media
// queries) stay hand-written in src/css/custom.css, which loads after this file.
//
// Mapping (tokens.json → Infima custom properties):
//   color.tokens        → --<name> per theme; the first theme on :root, later themes on [data-theme='<id>']
//   radius/shadow/layout and any other {tokens:[…]} family → --<name> on :root
//   type.families       → base → --ifm-font-family-base, monospace → --ifm-font-family-monospace,
//                         heading → --ifm-heading-font-family, anything else → --font-<key>
//   type styles         → body.fontSize → --ifm-font-size-base, body.lineHeight → --ifm-line-height-base,
//                         code.fontSize → --ifm-code-font-size, h1.fontWeight → --ifm-heading-font-weight
//   type.fonts          → one @font-face per entry, the file served from static/fonts/
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'design-system/tokens.json');
const target = resolve(root, 'src/css/tokens.css');

const tokens = JSON.parse(readFileSync(source, 'utf8'));
const name = (n) => `--${String(n).replace(/^--/, '')}`;
const colorValue = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? `var(${name(v.slice(1, -1))})` : v);
const fail = (msg) => {
  console.error(`build-theme: ${msg}`);
  process.exit(1);
};

const themes = tokens.color?.themes ?? [];
if (themes.length === 0) fail('tokens.json has no color.themes');
const [first, ...rest] = themes;

const blocks = [];
const push = (selector, lines) => {
  if (lines.length) blocks.push(`${selector} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}`);
};

// Colors: first theme on :root, each later theme as an override block.
const colorLines = (themeId, onlyDeclared) =>
  (tokens.color.tokens ?? []).flatMap((t) => {
    const v = typeof t.value === 'string' ? (onlyDeclared ? undefined : t.value) : t.value?.[themeId];
    return v === undefined ? [] : [`${name(t.name)}: ${colorValue(v)};`];
  });
push(`:root, [data-theme='${first.id}']`, colorLines(first.id, false));
for (const theme of rest) push(`[data-theme='${theme.id}']`, colorLines(theme.id, true));

// Every other list family (radius, shadow, layout, …) goes on :root.
const rootLines = [];
for (const [family, body] of Object.entries(tokens)) {
  if (['name', 'version', 'meta', 'color', 'type'].includes(family)) continue;
  for (const t of body?.tokens ?? []) rootLines.push(`${name(t.name)}: ${t.value};`);
}

// Type: families and the handful of Infima-level scalars.
const familyVar = {base: '--ifm-font-family-base', monospace: '--ifm-font-family-monospace', heading: '--ifm-heading-font-family'};
for (const [key, stack] of Object.entries(tokens.type?.families ?? {})) {
  rootLines.push(`${familyVar[key] ?? `--font-${key}`}: ${stack};`);
}
const styles = Object.fromEntries((tokens.type?.groups ?? []).flatMap((g) => g.styles.map((s) => [s.name, s])));
if (styles.body?.fontSize) rootLines.push(`--ifm-font-size-base: ${styles.body.fontSize};`);
if (styles.body?.lineHeight) rootLines.push(`--ifm-line-height-base: ${styles.body.lineHeight};`);
if (styles.code?.fontSize) rootLines.push(`--ifm-code-font-size: ${styles.code.fontSize};`);
if (styles.h1?.fontWeight) rootLines.push(`--ifm-heading-font-weight: ${styles.h1.fontWeight};`);
push(':root', rootLines);

for (const f of tokens.type?.fonts ?? []) {
  const file = String(f.file).replace(/^fonts\//, '');
  push('@font-face', [
    `font-family: '${f.family}';`,
    `src: url('/fonts/${file}');`,
    `font-weight: ${f.weight ?? '400'};`,
    `font-style: ${f.style ?? 'normal'};`,
    'font-display: swap;',
  ]);
}

const header = `/* ${tokens.name} — generated from design-system/tokens.json by scripts/build-theme.mjs. Do not edit; change tokens.json and run \`npm run theme\`. */`;
mkdirSync(dirname(target), {recursive: true});
writeFileSync(target, `${header}\n\n${blocks.join('\n\n')}\n`);
console.log(`build-theme: wrote ${target} (${themes.length} themes, ${tokens.color.tokens.length} colors)`);
