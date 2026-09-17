#!/usr/bin/env node
// Keep the mechanical parts of the wiki in step with local repository
// checkouts: a facts block on each project page, the project index table, and
// the recent-activity block of the changelog. Prose on project pages is left
// to the writing skills; this script never edits outside its markers.
//
//   npm run sync             write pages
//   npm run sync -- --check  exit 1 if anything is out of date
//
// Runs on a machine that has the team's repositories checked out. The project
// list lives in sync.config.local.json (untracked) merged over
// sync.config.json. Redaction and forbidden-term rules come from
// docs-policy.json and docs-policy.local.json.

import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const contentDir = path.resolve(root, process.env.DOCS_CONTENT_PATH ?? 'docs');
const projectsDir = path.join(contentDir, 'wiki', 'projects');
const today = new Date().toISOString().slice(0, 10);

const config = loadMerged('sync.config.json', 'sync.config.local.json', (base, local) => ({
  ...base,
  ...local,
  projects: [...(base.projects ?? []), ...(local.projects ?? [])],
}));
const policy = loadMerged('docs-policy.json', 'docs-policy.local.json', (base, local) => ({
  redact: [...(base.redact ?? []), ...(local.redact ?? [])],
  forbid: [...(base.forbid ?? []), ...(local.forbid ?? [])],
}));
const projectsRoot = expandHome(process.env.DS_PROJECTS_ROOT ?? config.projectsRoot ?? '~/code');
const redactions = policy.redact.map((r) => ({re: new RegExp(r.pattern, r.flags ?? 'g'), to: r.replacement}));
const forbidden = policy.forbid.map((r) => ({name: r.name, re: new RegExp(r.pattern, r.flags?.replace('g', '') ?? '')}));

function loadMerged(baseName, localName, merge) {
  const base = JSON.parse(readFileSync(path.join(root, baseName), 'utf8'));
  const localPath = path.join(root, localName);
  return existsSync(localPath) ? merge(base, JSON.parse(readFileSync(localPath, 'utf8'))) : merge(base, {});
}

function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

function git(cwd, args) {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
  } catch {
    return '';
  }
}

const redact = (text) => redactions.reduce((acc, {re, to}) => acc.replace(re, to), text);

function assertClean(text, where) {
  for (const {name, re} of forbidden) {
    const hit = text.match(re);
    if (hit) throw new Error(`Forbidden content (${name}) "${hit[0]}" in ${where}. Add a redact rule to docs-policy.local.json.`);
  }
}

function fileHas(dir, file, re) {
  const p = path.join(dir, file);
  return existsSync(p) && re.test(readFileSync(p, 'utf8'));
}

function manifestDescription(dir) {
  const py = path.join(dir, 'pyproject.toml');
  if (existsSync(py)) {
    const m = readFileSync(py, 'utf8').match(/^description\s*=\s*"([^"]+)"/m);
    if (m) return m[1];
  }
  const pkg = path.join(dir, 'package.json');
  if (existsSync(pkg)) {
    try {
      return JSON.parse(readFileSync(pkg, 'utf8')).description ?? '';
    } catch {
      return '';
    }
  }
  return '';
}

function detectStack(dir) {
  const stack = new Set();
  const has = (f) => existsSync(path.join(dir, f));
  if (has('pixi.toml')) stack.add('pixi');
  if (has('pyproject.toml') || has('pixi.toml')) stack.add('python');
  if (has('uv.lock') || fileHas(dir, 'pyproject.toml', /\[tool\.uv\]/)) stack.add('uv');
  if (has('package.json')) {
    stack.add('node');
    if (fileHas(dir, 'package.json', /"next"\s*:/)) stack.add('nextjs');
    if (has('tsconfig.json')) stack.add('typescript');
  }
  if (has('Dockerfile') || readdirSync(dir).some((f) => /^docker-compose.*\.ya?ml$/.test(f))) stack.add('docker');
  if (['pixi.toml', 'pyproject.toml', 'package.json', 'dock.yaml'].some((f) => fileHas(dir, f, /snowflake|snowpark/i))) stack.add('snowflake');
  if (has('Jenkinsfile')) stack.add('jenkins');
  if (has('.gitlab-ci.yml')) stack.add('gitlab-ci');
  return [...stack];
}

function webRoot(remote) {
  if (!remote) return null;
  let m = remote.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (m) return `https://${m[1]}/${m[2]}`;
  m = remote.match(/^https?:\/\/(?:[^@/]+@)?([^/]+)\/(.+?)(?:\.git)?\/?$/);
  return m ? `https://${m[1]}/${m[2]}` : null;
}

const yamlList = (items) => `[${items.map((s) => JSON.stringify(s)).join(', ')}]`;

function markers(key) {
  return {start: `<!-- sync:${key}:start -->`, end: `<!-- sync:${key}:end -->`};
}

// Replace the block between markers; append when absent, or insert after the
// frontmatter when `afterFrontmatter` is set.
function replaceBlock(text, key, block, {afterFrontmatter = false} = {}) {
  const {start, end} = markers(key);
  const wrapped = `${start}\n${block}\n${end}`;
  if (text.includes(start) && text.includes(end)) {
    const from = text.indexOf(start);
    const to = text.indexOf(end) + end.length;
    return text.slice(0, from) + wrapped + text.slice(to);
  }
  if (afterFrontmatter) {
    const fm = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (fm) return `${fm[0]}\n${wrapped}\n${text.slice(fm[0].length).replace(/^\n+/, '\n')}`;
  }
  return `${text.trimEnd()}\n\n${wrapped}\n`;
}

function factsBlock(info) {
  const rows = [
    ['Stack', info.stack.length ? info.stack.map((s) => `\`${s}\``).join(', ') : 'not detected'],
    ['Repository', info.web ? `<${info.web}>` : 'no remote configured'],
    ['Default branch', info.branch || 'unknown'],
    ['Last commit', info.lastCommit || 'unknown'],
    ['Synced', today],
  ];
  const activity = info.commits.length
    ? info.commits.map((c) => `- ${c.date} \`${c.hash}\` ${c.subject}`).join('\n')
    : `- No commits in the last ${config.changelog.days} days.`;
  return ['| | |', '| --- | --- |', ...rows.map(([k, v]) => `| **${k}** | ${v} |`), '', '### Recent activity', '', activity].join('\n');
}

// New pages start from the template with frontmatter filled and prose left as
// the template's prompts for a writing skill.
function newPage(p, info) {
  const template = readFileSync(path.join(root, 'templates', 'project-page.md'), 'utf8');
  const body = template.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^<!-- doc-metadata[^\n]*\n\n?/m, '');
  const {start, end} = markers('facts');
  const head = [
    '---',
    `title: ${JSON.stringify(p.title ?? p.name)}`,
    `description: ${JSON.stringify(info.summary)}`,
    `tags: ${yamlList([...new Set([...(p.tags ?? []), ...info.stack])])}`,
    'related: []',
    `status: ${p.status ?? 'active'}`,
    `last_reviewed: ${today}`,
    ...(p.owner ? [`owner: ${JSON.stringify(p.owner)}`] : []),
    ...(info.web ? [`repo: ${info.web}`] : []),
    '---',
    '',
    `<!-- doc-metadata: source=${info.web ?? p.name}@${info.head} generated-by=sync-projects -->`,
    '',
    ':::note[Awaiting a writer]',
    `Facts below are synced from the repository. The narrative sections are template prompts until \`ds-wiki-project\` writes them.`,
    ':::',
    '',
    start,
    factsBlock(info),
    end,
    '',
  ].join('\n');
  return `${head}\n${body}`;
}

const plan = (file, content) => ({file, content, current: existsSync(file) ? readFileSync(file, 'utf8') : null});

const outputs = [];
const rows = [];
const allCommits = [];
const missing = [];

for (const p of config.projects) {
  const dir = path.isAbsolute(p.path ?? '') ? p.path : path.join(projectsRoot, p.path ?? p.name);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    missing.push(`${p.name} (${dir})`);
    continue;
  }
  const web = webRoot(redact(git(dir, ['remote', 'get-url', 'origin'])));
  const log = git(dir, ['log', `--since=${config.changelog.days} days ago`, `-n${config.changelog.perProject}`, '--format=%h%x1f%cs%x1f%s']);
  const info = {
    summary: redact(p.summary || manifestDescription(dir)),
    stack: detectStack(dir),
    web,
    branch: git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']) || 'main',
    head: git(dir, ['rev-parse', '--short', 'HEAD']) || 'unknown',
    lastCommit: git(dir, ['log', '-1', '--format=%cs']),
    commits: log
      ? log.split('\n').map((l) => {
          const [hash, date, subject] = l.split('\x1f');
          return {hash, date, subject: redact(subject.replace(/\|/g, '\\|'))};
        })
      : [],
  };
  const file = path.join(projectsDir, `${p.name}.md`);
  const content = existsSync(file)
    ? replaceBlock(readFileSync(file, 'utf8'), 'facts', factsBlock(info), {afterFrontmatter: true})
    : newPage(p, info);
  assertClean(content, `${p.name} page`);
  outputs.push(plan(file, content));
  const status = (content.match(/^status:\s*(\S+)/m) ?? [])[1] ?? p.status ?? 'active';
  rows.push(`| [${p.title ?? p.name}](${p.name}.md) | ${info.summary} | ${status} | ${info.lastCommit || '—'} |`);
  for (const c of info.commits) allCommits.push({...c, project: p.title ?? p.name});
}

const indexBlock = rows.length
  ? ['| Project | Summary | Status | Last commit |', '| --- | --- | --- | --- |', ...rows].join('\n')
  : 'No projects are registered in `sync.config.local.json` on this machine.';
const indexFile = path.join(projectsDir, 'index.md');
outputs.push(plan(indexFile, replaceBlock(readFileSync(indexFile, 'utf8'), 'projects', indexBlock)));

allCommits.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const byDate = new Map();
for (const c of allCommits.slice(0, config.changelog.total)) {
  if (!byDate.has(c.date)) byDate.set(c.date, []);
  byDate.get(c.date).push(c);
}
const changelogBlock = byDate.size
  ? [...byDate.entries()].flatMap(([date, cs]) => [`### ${date}`, '', ...cs.map((c) => `- **${c.project}** ${c.subject} (\`${c.hash}\`)`), '']).join('\n').trimEnd()
  : 'No repository activity has been synced on this machine.';
const changelogFile = path.join(contentDir, 'wiki', 'changelog.md');
outputs.push(plan(changelogFile, replaceBlock(readFileSync(changelogFile, 'utf8'), 'changelog', changelogBlock)));

for (const o of outputs) assertClean(o.content, path.relative(root, o.file));

const changed = outputs.filter((o) => o.current !== o.content);
if (missing.length) console.warn(`Skipped missing repositories:\n  ${missing.join('\n  ')}`);
if (check) {
  if (changed.length) {
    console.error(`Out of date:\n  ${changed.map((o) => path.relative(root, o.file)).join('\n  ')}`);
    process.exit(1);
  }
  console.log('Wiki facts are in sync.');
} else {
  mkdirSync(projectsDir, {recursive: true});
  for (const o of changed) writeFileSync(o.file, o.content);
  console.log(`Synced ${rows.length} project(s); wrote ${changed.length} file(s).`);
}
