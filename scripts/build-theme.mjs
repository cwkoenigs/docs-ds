// Generates src/css/tokens.css from design-system/tokens.json and copies the marks under
// design-system/assets/Logos/ into static/img/.
//
// design-system/tokens.json is the one source for every theme value; it is the same file the
// team's Design System artifact holds, so a change made there and synced here (or here and synced
// there) reaches the site on the next build. Rules that are not values (selectors, layout, media
// queries) stay hand-written in src/css/custom.css, which loads after this file and may contain no
// literal value of its own (scripts/check-theme.mjs enforces that).
//
// Mapping (tokens.json → custom properties):
//   color.tokens        → --<name> per theme; the first theme on :root, later themes on [data-theme='<id>'];
//                         a value "{other}" becomes var(--other)
//   spacing/border/radius/shadow/layout and any other {tokens:[…]} family → --<name> on :root
//   type.families       → base → --ifm-font-family-base, monospace → --ifm-font-family-monospace,
//                         heading → --ifm-heading-font-family, anything else → --font-<key>
//   type styles         → --type-<name>-size / -weight / -leading / -tracking for every style, plus
//                         the Infima scalars: body → --ifm-font-size-base and --ifm-line-height-base,
//                         code.fontSize → --ifm-code-font-size, h1.fontWeight → --ifm-heading-font-weight
//   type.fonts          → one @font-face per entry, the file served from static/fonts/
import {copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const paths = {
  tokens: resolve(root, 'design-system/tokens.json'),
  css: resolve(root, 'src/css/tokens.css'),
  logos: resolve(root, 'design-system/assets/Logos'),
  img: resolve(root, 'static/img'),
  custom: resolve(root, 'src/css/custom.css'),
};

export const readTokens = () => JSON.parse(readFileSync(paths.tokens, 'utf8'));

/** Files under design-system/assets/Logos that are marks (everything but the group's README). */
export const logoFiles = () => readdirSync(paths.logos).filter((f) => !f.startsWith('.') && !/\.md$/i.test(f)).sort();

const name = (n) => `--${String(n).replace(/^--/, '')}`;
const value = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? `var(${name(v.slice(1, -1))})` : v);

export function renderCss(tokens) {
  const themes = tokens.color?.themes ?? [];
  if (themes.length === 0) throw new Error('tokens.json has no color.themes');
  const [first, ...rest] = themes;

  const blocks = [];
  const push = (selector, lines) => {
    if (lines.length) blocks.push(`${selector} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}`);
  };

  // Colors: first theme on :root, each later theme as an override block of what it declares.
  const colorLines = (themeId, onlyDeclared) =>
    (tokens.color.tokens ?? []).flatMap((t) => {
      const v = typeof t.value === 'string' ? (onlyDeclared ? undefined : t.value) : t.value?.[themeId];
      return v === undefined ? [] : [`${name(t.name)}: ${value(v)};`];
    });
  push(`:root, [data-theme='${first.id}']`, colorLines(first.id, false));
  for (const theme of rest) push(`[data-theme='${theme.id}']`, colorLines(theme.id, true));

  // Every other list family (spacing, border, radius, shadow, layout, …) goes on :root.
  const rootLines = [];
  for (const [family, body] of Object.entries(tokens)) {
    if (['name', 'version', 'meta', 'color', 'type'].includes(family)) continue;
    for (const t of body?.tokens ?? []) rootLines.push(`${name(t.name)}: ${value(t.value)};`);
  }

  // Type: families, the Infima-level scalars, then one set of properties per style.
  const familyVar = {base: '--ifm-font-family-base', monospace: '--ifm-font-family-monospace', heading: '--ifm-heading-font-family'};
  for (const [key, stack] of Object.entries(tokens.type?.families ?? {})) {
    rootLines.push(`${familyVar[key] ?? `--font-${key}`}: ${stack};`);
  }
  const styles = (tokens.type?.groups ?? []).flatMap((g) => g.styles);
  const byName = Object.fromEntries(styles.map((s) => [s.name, s]));
  if (byName.body?.fontSize) rootLines.push(`--ifm-font-size-base: ${byName.body.fontSize};`);
  if (byName.body?.lineHeight) rootLines.push(`--ifm-line-height-base: ${byName.body.lineHeight};`);
  if (byName.code?.fontSize) rootLines.push(`--ifm-code-font-size: ${byName.code.fontSize};`);
  if (byName.h1?.fontWeight) rootLines.push(`--ifm-heading-font-weight: ${byName.h1.fontWeight};`);
  const styleProps = [['fontSize', 'size'], ['fontWeight', 'weight'], ['lineHeight', 'leading'], ['letterSpacing', 'tracking']];
  for (const s of styles) {
    for (const [key, suffix] of styleProps) {
      if (s[key] !== undefined) rootLines.push(`--type-${s.name}-${suffix}: ${s[key]};`);
    }
  }
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
  return `${header}\n\n${blocks.join('\n\n')}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const tokens = readTokens();
    mkdirSync(dirname(paths.css), {recursive: true});
    writeFileSync(paths.css, renderCss(tokens));
    mkdirSync(paths.img, {recursive: true});
    const logos = logoFiles();
    for (const f of logos) copyFileSync(resolve(paths.logos, f), resolve(paths.img, f));
    const styles = (tokens.type?.groups ?? []).flatMap((g) => g.styles).length;
    console.log(`build-theme: wrote ${paths.css} (${tokens.color.themes.length} themes, ${tokens.color.tokens.length} colors, ${styles} type styles) and ${logos.length} mark(s) to static/img/`);
  } catch (error) {
    console.error(`build-theme: ${error.message}`);
    process.exit(1);
  }
}
