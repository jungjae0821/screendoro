#!/usr/bin/env node
// Gather what the earlier doro-* steps left in the project into one short summary.
//
//   node report.cjs [project root]
//
// Reads (all optional):
//   screendoro/render/*-report.json   doro-check results (the latest run per screen)
//   screendoro/draft.md               verdict tables from doro-draft
//   DESIGN.md                         values still marked [AI]
//   source files                      TODO(screendoro) placeholders
// Prints Markdown facts to stdout. It does not write anything.
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || '.');
const read = p => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch { return null; } };
const out = [];

// ---------- checks ----------
const renderDir = path.join(root, 'screendoro/render');
const reports = fs.existsSync(renderDir) ? fs.readdirSync(renderDir).filter(f => f.endsWith('-report.json')) : [];
out.push('## Checks');
if (!reports.length) out.push('- No doro-check report found: rendering unverified.');
for (const f of reports) {
  let r; try { r = JSON.parse(fs.readFileSync(path.join(renderDir, f), 'utf8')); } catch { out.push(`- ${f}: unreadable`); continue; }
  const screen = f.replace(/-report\.json$/, '');
  const widths = Object.entries(r.widths || {}).filter(([, v]) => !v.error).map(([k]) => k);
  const perf = Object.values(r.widths || {}).map(v => v.perf).find(p => p && typeof p === 'object');
  const parts = [
    widths.length ? `checked at ${widths.join('/')}` : 'did not open',
    `console errors ${(r.consoleErrors || []).length}`,
    `failed requests ${(r.failedRequests || []).length}`,
  ];
  if (perf) parts.push(`CLS ${perf.cls}, LCP ${perf.lcpMs}ms (local)`);
  out.push(`- ${screen}: ${parts.join(' · ')}`);
  for (const x of r.required || []) out.push(`  - still required: ${x}`);
  for (const x of r.recommended || []) out.push(`  - recommended: ${x}`);
}

// ---------- draft verdicts ----------
const draft = read('screendoro/draft.md');
out.push('', '## Draft');
if (!draft) out.push('- No screendoro/draft.md.');
else {
  for (const block of draft.split(/^## /m).slice(1)) {
    const title = block.split('\n')[0].trim();
    if (/no draft/i.test(block) && !/\|\s*\d+\s*\|/.test(block)) { out.push(`- ${title}: no draft (skipped by user)`); continue; }
    const rows = block.split('\n').filter(l => /^\|\s*\d+\s*\|/.test(l)).map(l => l.split('|').map(c => c.trim()));
    if (!rows.length) { out.push(`- ${title}: no differences`); continue; }
    const count = (col, re) => rows.filter(c => re.test(c[col] || '')).length;
    const open = rows.filter(c => !(c[6] || '').trim() || /대기|pending|^\(?\s*\)?$/i.test(c[6])).length;
    out.push(`- ${title}: ${rows.length} differences (user ${count(3, /user/i)} · AI ${count(3, /^ai$/i)}) → draft ${count(6, /^draft/i)} · AI ${count(6, /^ai/i)} · mix ${count(6, /^mix/i)}${open ? ` · ${open} without verdict` : ''}`);
  }
}

// ---------- DESIGN.md [AI] values ----------
const design = read('DESIGN.md');
out.push('', '## DESIGN.md values the user has not seen');
if (!design) out.push('- No DESIGN.md.');
else {
  const ai = design.split('\n').filter(l => l.includes('[AI]')).map(l => l.replace(/\[AI\]/g, '').replace(/^\s*[-|]\s*/, '').split(/\s*\|\s*|:\s|\.\s/)[0].trim().slice(0, 40));
  out.push(ai.length ? `- ${ai.length} marked [AI]: ${ai.slice(0, 8).join('; ')}${ai.length > 8 ? ` (+${ai.length - 8})` : ''}` : '- None.');
}

// ---------- placeholders ----------
const skip = new Set(['node_modules', '.git', 'screendoro', '.claude', '.agents', 'dist', 'build', '.next']);
const exts = /\.(html?|jsx?|tsx?|vue|svelte|astro|css|scss)$/i;
const todos = [];
(function walk(dir, depth) {
  if (depth > 8) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else if (exts.test(e.name)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        const m = l.match(/TODO\(screendoro\):?\s*(.*)/);
        if (m) todos.push(`${path.relative(root, p).replace(/\\/g, '/')}:${i + 1} ${m[1].replace(/\*\/|-->/g, '').trim().slice(0, 80)}`);
      });
    }
  }
})(root, 0);
out.push('', '## Real content still needed');
out.push(todos.length ? todos.map(t => `- ${t}`).join('\n') : '- None.');

console.log(out.join('\n'));
