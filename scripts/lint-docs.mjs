#!/usr/bin/env node
// Structural and hygiene checks for the docs content, independent of the
// Docusaurus build (which already fails on broken links and images).
//
//   node scripts/lint-docs.mjs            errors fail; warnings and info are printed
//   node scripts/lint-docs.mjs --strict   warnings fail too
//   node scripts/lint-docs.mjs --json     machine-readable findings for skills
//
// Rules come from docs-policy.json, merged with the untracked
// docs-policy.local.json when present (company names, internal hosts).

import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const docsDir = path.resolve(root, process.env.DOCS_CONTENT_PATH ?? 'docs');
const strict = process.argv.includes('--strict');
const json = process.argv.includes('--json');

const policy = loadPolicy();
const findings = [];
const report = (level, file, message, line) => findings.push({level, file: rel(file), line, message});

function rel(file) {
  return path.relative(root, file);
}

function loadPolicy() {
  const base = JSON.parse(readFileSync(path.join(root, 'docs-policy.json'), 'utf8'));
  const localPath = path.join(root, 'docs-policy.local.json');
  if (!existsSync(localPath)) return base;
  const local = JSON.parse(readFileSync(localPath, 'utf8'));
  return {
    ...base,
    ...local,
    forbid: [...(base.forbid ?? []), ...(local.forbid ?? [])],
    allowedHosts: [...(base.allowedHosts ?? []), ...(local.allowedHosts ?? [])],
  };
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!['assets', 'stylesheets'].includes(name)) out.push(...walk(full));
    } else if (/\.mdx?$/.test(name) && !name.startsWith('_')) {
      out.push(full);
    }
  }
  return out;
}

// Minimal YAML subset: scalars, quoted scalars, inline lists, and block lists.
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return {data: null, body: text, lines: 0};
  const data = {};
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const block = raw.match(/^\s+-\s*(.*)$/);
    if (block && key) {
      (data[key] ||= []).push(unquote(block[1]));
      continue;
    }
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const value = kv[2].trim();
    if (value === '') data[key] = data[key] ?? [];
    else if (value.startsWith('[')) data[key] = value.replace(/^\[|\]$/g, '').split(',').map((s) => unquote(s.trim())).filter(Boolean);
    else data[key] = unquote(value);
  }
  return {data, body: text.slice(m[0].length), lines: m[0].split('\n').length - 1};
}

function unquote(s) {
  return s.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const daysSince = (s) => Math.floor((Date.now() - Date.parse(s)) / 86_400_000);

function stripCode(body) {
  return body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

function wordCount(body) {
  return stripCode(body).replace(/:::[^\n]*/g, '').split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------

const files = walk(docsDir);
const pages = new Map();
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const {data, body, lines} = parseFrontmatter(text);
  pages.set(file, {file, text, data, body, fmLines: lines});
}

const titles = new Map();
const linkedTo = new Set();
const wikiDir = path.join(docsDir, 'wiki');
const isUnder = (file, ...segments) => file.startsWith(path.join(docsDir, ...segments) + path.sep);
const isIndex = (file) => path.basename(file) === 'index.md';

for (const page of pages.values()) {
  const {file, text, data, body, fmLines} = page;

  // Frontmatter basics
  if (!data) {
    report('error', file, 'Missing YAML frontmatter.');
  } else {
    if (!data.title) report('error', file, 'Frontmatter needs a `title`.');
    if (data.sidebar_position !== undefined && Number.isNaN(Number(data.sidebar_position))) {
      report('error', file, '`sidebar_position` must be a number.');
    }
    if (data.title) {
      const key = String(data.title).toLowerCase();
      if (titles.has(key) && !isIndex(file)) report('warn', file, `Duplicate title "${data.title}" also used by ${rel(titles.get(key))}.`);
      titles.set(key, titles.get(key) ?? file);
    }
  }

  // Section contracts
  if (data && isUnder(file, 'wiki', 'projects') && !isIndex(file)) {
    for (const field of policy.project.required) {
      if (data[field] === undefined || (Array.isArray(data[field]) && field !== 'related' && data[field].length === 0)) {
        report('error', file, `Project page needs frontmatter \`${field}\`.`);
      }
    }
    for (const r of data.related ?? []) {
      if (!existsSync(path.join(docsDir, 'wiki', 'projects', `${r}.md`))) report('error', file, `\`related\` entry "${r}" has no page in wiki/projects/.`);
    }
    if (data.status && !policy.project.statuses.includes(data.status)) {
      report('error', file, `\`status\` must be one of ${policy.project.statuses.join(', ')}.`);
    }
    if (data.last_reviewed !== undefined) {
      if (!isDate(data.last_reviewed)) report('error', file, '`last_reviewed` must be YYYY-MM-DD.');
      else if (daysSince(data.last_reviewed) > policy.staleDays) report('warn', file, `Not reviewed for ${daysSince(data.last_reviewed)} days (limit ${policy.staleDays}).`);
    }
  }
  if (data && isUnder(file, 'wiki', 'insights') && !isIndex(file)) {
    for (const field of policy.insight.required) if (!data[field]) report('error', file, `Insight needs frontmatter \`${field}\`.`);
    if (data.date && !isDate(data.date)) report('error', file, '`date` must be YYYY-MM-DD.');
  }
  if (data && isUnder(file, 'wiki', 'adr') && !isIndex(file) && path.basename(file) !== 'template.md') {
    if (!/^ADR-\d{3,}:/.test(String(data.title ?? ''))) report('error', file, 'ADR title must look like "ADR-001: Decision".');
    if (!policy.adr.statuses.includes(data.status)) report('error', file, `ADR \`status\` must be one of ${policy.adr.statuses.join(', ')}.`);
    if (!isDate(data.date)) report('error', file, 'ADR needs `date` as YYYY-MM-DD.');
  }
  if (file === path.join(wikiDir, 'changelog.md')) checkChangelog(page);

  // Content hygiene (outside code blocks)
  const prose = stripCode(body);
  const bodyLines = body.split('\n');
  const lineOf = (needle) => {
    const i = bodyLines.findIndex((l) => l.includes(needle));
    return i >= 0 ? i + fmLines + 1 : undefined;
  };
  for (const rule of policy.forbid ?? []) {
    const re = new RegExp(rule.pattern, rule.flags ?? 'g');
    const hit = re.exec(text);
    if (hit) report('error', file, `Forbidden content (${rule.name}): "${hit[0]}".`, text.slice(0, hit.index).split('\n').length);
  }
  for (const marker of policy.markers ?? []) {
    if (prose.includes(marker)) report('warn', file, `Contains "${marker}" marker.`, lineOf(marker));
  }
  if (policy.stubPatterns.some((p) => new RegExp(p).test(prose))) {
    report('info', file, 'Stub page: placeholder admonition present.');
  } else if (!isIndex(file) && wordCount(body) < policy.minWords) {
    report('info', file, `Thin page: ${wordCount(body)} words (minimum ${policy.minWords}).`);
  }

  // Links
  for (const m of prose.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<(https?:\/\/[^>\s]+)>/g)) {
    const href = m[1] ?? m[2];
    if (/^https?:\/\//.test(href)) {
      const host = new URL(href).hostname;
      if (/^(localhost|127\.0\.0\.1)$/.test(host)) continue;
      if (!policy.allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        report('warn', file, `Link host "${host}" is not in the allowlist; use a placeholder or add it to docs-policy.json.`);
      }
      continue;
    }
    if (href.startsWith('/')) {
      report('error', file, `Absolute site link ${href}; use a relative path so base URL changes keep working.`);
      continue;
    }
    if (href.startsWith('#') || /^[a-z]+:/i.test(href)) continue;
    const target = path.resolve(path.dirname(file), href.split('#')[0]);
    for (const candidate of [target, `${target}.md`, `${target}.mdx`, path.join(target, 'index.md')]) {
      if (pages.has(candidate)) {
        linkedTo.add(candidate);
        break;
      }
    }
  }
}

// Orphans: wiki pages nothing links to (the autogenerated sidebar still shows them).
for (const file of pages.keys()) {
  if (isUnder(file, 'wiki') && !isIndex(file) && !linkedTo.has(file) && file !== path.join(wikiDir, 'changelog.md') && file !== path.join(wikiDir, 'adr-index.md')) {
    report('info', file, 'No other page links here.');
  }
}

function checkChangelog({file, body, fmLines}) {
  let previous = null;
  let inCode = false;
  body.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) inCode = !inCode;
    if (inCode) return;
    const lineNo = i + fmLines + 1;
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      const date = heading[1].trim();
      if (!isDate(date)) report('error', file, `Changelog heading "${date}" must be a date (## YYYY-MM-DD).`, lineNo);
      else if (previous && date > previous) report('error', file, `Changelog date ${date} appears after ${previous}; newest first.`, lineNo);
      previous = isDate(date) ? date : previous;
      return;
    }
    if (/^- /.test(line) && previous && !/^- \*\*[^*]+\*\*/.test(line)) {
      report('error', file, 'Changelog entry must start with the bold project name: `- **name** summary`.', lineNo);
    }
  });
}

// ---------------------------------------------------------------------------

const order = {error: 0, warn: 1, info: 2};
findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));
const counts = {error: 0, warn: 0, info: 0};
for (const f of findings) counts[f.level]++;

if (json) {
  console.log(JSON.stringify({docsDir: rel(docsDir), pages: pages.size, counts, findings}, null, 2));
} else {
  for (const f of findings) console.log(`${f.level.padEnd(5)} ${f.file}${f.line ? `:${f.line}` : ''}  ${f.message}`);
  console.log(`\n${pages.size} pages: ${counts.error} errors, ${counts.warn} warnings, ${counts.info} notes.`);
}
process.exit(counts.error > 0 || (strict && counts.warn > 0) ? 1 : 0);
