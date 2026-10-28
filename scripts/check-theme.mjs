// Checks that the shell implements design-system/tokens.json and nothing else:
//   1. tokens.json has the shape the Design System artifact reads (list families, unique names,
//      parsable colors, aliases that resolve, type styles with sizes);
//   2. the generated files are current (src/css/tokens.css, the marks copied to static/img/);
//   3. src/css/custom.css holds rules only: no color, length or shadow literal (the one allowed
//      literal is the breakpoint inside a media query, which CSS cannot read from a property);
//   4. every text-on-ground pair the brand book claims reads at 4.5:1 in every theme (3:1 for the
//      navbar rule), and the monogram's literal fills are the light theme's primary and navy.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {logoFiles, paths, readTokens, renderCss} from './build-theme.mjs';

const tokens = readTokens();
const problems = [];
const problem = (message) => problems.push(message);

// 1. Shape.
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const RESERVED = ['name', 'version', 'meta', 'type'];
const owner = new Map();
for (const [family, body] of Object.entries(tokens)) {
  if (RESERVED.includes(family)) continue;
  if (!Array.isArray(body?.tokens)) {
    problem(`${family}: must be {tokens: […]}, a list the Design System page can read`);
    continue;
  }
  for (const t of body.tokens) {
    if (!NAME.test(t.name ?? '')) problem(`${family}: "${t.name}" is not a valid token name`);
    if (owner.has(t.name)) problem(`${t.name}: declared in both ${owner.get(t.name)} and ${family}`);
    owner.set(t.name, family);
    if (!t.usage) problem(`${t.name}: has no usage note`);
    if (t.value === undefined || t.value === '') problem(`${t.name}: has no value`);
  }
}
const themes = (tokens.color?.themes ?? []).map((t) => t.id);
if (themes.length === 0) problem('color.themes is empty');
const colorNames = new Set((tokens.color?.tokens ?? []).map((t) => t.name));
const COLOR = /^(#[0-9a-f]{3,8}|(rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*\))$/;
const alias = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? v.slice(1, -1) : null);
for (const t of tokens.color?.tokens ?? []) {
  const values = typeof t.value === 'string' ? {[themes[0]]: t.value} : t.value ?? {};
  if (Object.keys(values).length === 0) problem(`${t.name}: no value in any theme`);
  for (const [theme, v] of Object.entries(values)) {
    if (!themes.includes(theme)) problem(`${t.name}: value for unknown theme "${theme}"`);
    const target = alias(v);
    if (target !== null) {
      if (target === t.name || !colorNames.has(target)) problem(`${t.name}: alias {${target}} does not name another color token`);
    } else if (!COLOR.test(String(v))) {
      problem(`${t.name} (${theme}): "${v}" is not a hex or function color`);
    }
  }
}
const families = tokens.type?.families ?? {};
const styleNames = new Set();
for (const group of tokens.type?.groups ?? []) {
  if (!families[group.family]) problem(`type group "${group.name}": family "${group.family}" is not in type.families`);
  for (const s of group.styles ?? []) {
    if (!NAME.test(s.name ?? '')) problem(`type style "${s.name}": not a valid name`);
    if (styleNames.has(s.name)) problem(`type style "${s.name}": declared twice`);
    styleNames.add(s.name);
    if (!s.fontSize) problem(`type style "${s.name}": has no fontSize`);
    if (!s.usage) problem(`type style "${s.name}": has no usage note`);
  }
}

// 2. Generated files are current.
if (problems.length === 0) {
  if (readFileSync(paths.css, 'utf8') !== renderCss(tokens)) problem('src/css/tokens.css is stale: run `npm run theme` and commit it');
  for (const f of logoFiles()) {
    let same = false;
    try {
      same = readFileSync(resolve(paths.logos, f)).equals(readFileSync(resolve(paths.img, f)));
    } catch {}
    if (!same) problem(`static/img/${f} differs from design-system/assets/Logos/${f}: run \`npm run theme\``);
  }
}

// 3. custom.css holds rules only.
const custom = readFileSync(paths.custom, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|(?<![\w.-])\d*\.?\d+(?:px|rem|em|vw|vh|%)(?![\w-])/g;
custom.split('\n').forEach((line, index) => {
  const outsideMedia = line.replace(/@media[^{]*/g, '');
  for (const hit of outsideMedia.match(LITERAL) ?? []) {
    if (hit === '100%') continue;
    problem(`custom.css:${index + 1}: literal value ${hit}; add a token to design-system/tokens.json instead`);
  }
});

// 4. Contrast.
const ground = 'ifm-background-color';
const byName = Object.fromEntries((tokens.color?.tokens ?? []).map((t) => [t.name, t]));
const raw = (n, theme, depth = 0) => {
  const t = byName[n];
  if (!t || depth > 16) return undefined;
  const v = typeof t.value === 'string' ? t.value : t.value[theme] ?? t.value[themes[0]];
  const target = alias(v);
  return target !== null ? raw(target, theme, depth + 1) : v;
};
const parse = (v) => {
  if (typeof v !== 'string') return undefined;
  let m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(v);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = [0, 2, 4, 6].map((i) => (h.length > i ? parseInt(h.slice(i, i + 2), 16) : 255));
    return [n[0], n[1], n[2], n[3] / 255];
  }
  m = /^rgba?\(\s*([\d.]+)\s*,?\s*([\d.]+)\s*,?\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(v);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [+m[1], +m[2], +m[3], a];
  }
  return undefined;
};
const over = (top, under) => top.slice(0, 3).map((c, i) => c * top[3] + under[i] * (1 - top[3]));
const luminance = (rgb) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const pairs = [
  ['ifm-font-color-base', 'ifm-background-color'],
  ['ifm-font-color-base', 'ifm-background-surface-color'],
  ['ifm-font-color-base', 'ifm-code-background'],
  ['ifm-color-content-secondary', 'ifm-background-color'],
  ['ifm-link-color', 'ifm-background-color'],
  ['ifm-link-color', 'ifm-background-surface-color'],
  ['ifm-link-hover-color', 'ifm-background-color'],
  ['ifm-menu-color', 'ifm-background-color'],
  ['ifm-menu-color-active', 'ifm-menu-color-background-active'],
  ['ifm-navbar-link-color', 'ifm-navbar-background-color'],
  ['ifm-navbar-link-hover-color', 'ifm-navbar-background-color'],
  ['ifm-navbar-search-input-color', 'ifm-navbar-search-input-background-color'],
  ['ifm-navbar-search-input-placeholder-color', 'ifm-navbar-search-input-background-color'],
  ['search-local-input-active-border-color', 'ifm-navbar-background-color', 3],
  ['ifm-footer-color', 'ifm-footer-background-color'],
  ['ifm-footer-link-color', 'ifm-footer-background-color'],
  ['ifm-footer-link-hover-color', 'ifm-footer-background-color'],
  ['search-local-hit-color', 'search-local-hit-background'],
  ['search-local-muted-color', 'search-local-hit-background'],
  ['search-local-highlight-color', 'search-local-hit-background'],
  ['search-local-hit-active-color', 'search-local-highlight-color'],
  ['ifm-color-primary', 'ifm-navbar-background-color', 3],
];
for (const theme of themes) {
  const page = parse(raw(ground, theme));
  for (const [fg, bg, minimum = 4.5] of pairs) {
    const f = parse(raw(fg, theme));
    const b = parse(raw(bg, theme));
    if (!f || !b || !page) {
      problem(`${fg} on ${bg} (${theme}): cannot resolve a color`);
      continue;
    }
    const under = over(b, over(page, [255, 255, 255, 1]));
    const ratio = contrast(over(f, under), under);
    if (ratio < minimum) problem(`${fg} on ${bg} (${theme}): ${ratio.toFixed(2)}:1, below ${minimum}:1`);
  }
}
for (const f of logoFiles()) {
  if (!/\.svg$/i.test(f)) continue;
  const svg = readFileSync(resolve(paths.logos, f), 'utf8');
  for (const token of ['ifm-color-primary', 'ifm-font-color-base']) {
    const v = raw(token, themes[0]);
    if (!svg.includes(v)) problem(`${f}: does not use ${token}'s light value ${v} as a literal fill`);
  }
}

if (problems.length) {
  console.error(`check-theme: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`check-theme: ${owner.size} tokens in ${new Set(owner.values()).size} families, ${styleNames.size} type styles, ${pairs.length} contrast pairs × ${themes.length} themes, custom.css literal-free.`);
