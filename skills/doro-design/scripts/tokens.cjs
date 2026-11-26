#!/usr/bin/env node
// Turn the YAML front matter of DESIGN.md into CSS custom properties.
//
//   node tokens.cjs [DESIGN.md] [--out tokens.css] [--check]
//
// Without --out the CSS goes to stdout. With --check, exit 1 when the --out file
// is missing or differs from what DESIGN.md would generate (nothing is written).
//
// Mapping:
//   colors.x                -> --color-x
//   typography.x.fontSize   -> --text-x        fontFamily -> --font-x
//   typography.x.fontWeight -> --weight-x      lineHeight -> --leading-x
//   typography.x.letterSpacing -> --tracking-x
//   spacing.x               -> --space-x
//   rounded.x               -> --radius-x
//   shadows.x               -> --shadow-x
// Other top-level keys (name, surface, components, ...) are ignored.
// Only nested maps with scalar values are supported, which is all DESIGN.md uses.
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flagIndex = name => args.indexOf('--' + name);
const outIdx = flagIndex('out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
const check = flagIndex('check') >= 0;
const positional = args.filter((a, i) => !a.startsWith('--') && !(outIdx >= 0 && i === outIdx + 1));
const src = positional[0] || 'DESIGN.md';

function fail(msg) { console.error('tokens: ' + msg); process.exit(2); }

if (!fs.existsSync(src)) fail(`${src} not found`);
const text = fs.readFileSync(src, 'utf8').replace(/^﻿/, '');
const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!m) fail(`${src} has no YAML front matter`);

function scalar(raw) {
  let v = raw.trim();
  if (/^(["']).*\1$/.test(v)) return v.slice(1, -1);
  const hash = v.search(/\s#/);
  if (hash >= 0) v = v.slice(0, hash).trim();
  return v;
}

const root = {};
const stack = [{ indent: -1, obj: root }];
m[1].split(/\r?\n/).forEach((line, n) => {
  if (!line.trim() || line.trim().startsWith('#')) return;
  if (/^\s*-\s/.test(line)) return; // lists are not used for tokens
  const indent = line.match(/^ */)[0].length;
  const kv = line.trim().match(/^("[^"]+"|'[^']+'|[^:]+):(.*)$/);
  if (!kv) fail(`front matter line ${n + 2} is not "key: value": ${line.trim()}`);
  const key = kv[1].replace(/^["']|["']$/g, '').trim();
  while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
  const parent = stack[stack.length - 1].obj;
  if (kv[2].trim() === '') {
    parent[key] = {};
    stack.push({ indent, obj: parent[key] });
  } else {
    parent[key] = scalar(kv[2]);
  }
});

const slug = s => String(s).trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
const lines = [];
const problems = [];
const add = (name, value, where) => {
  if (typeof value !== 'string') { problems.push(`${where} is not a single value`); return; }
  if (/\{[^}]+\}/.test(value)) { problems.push(`${where} references another token; base tokens hold literal values`); return; }
  lines.push(`  --${name}: ${value};`);
};
const flat = (group, prefix) => {
  const g = root[group];
  if (!g) return;
  if (typeof g !== 'object') { problems.push(`${group} should be a map`); return; }
  lines.push(`  /* ${group} */`);
  for (const [k, v] of Object.entries(g)) add(`${prefix}-${slug(k)}`, v, `${group}.${k}`);
};

flat('colors', 'color');
if (root.typography && typeof root.typography === 'object') {
  lines.push('  /* typography */');
  const props = { fontSize: 'text', fontFamily: 'font', fontWeight: 'weight', lineHeight: 'leading', letterSpacing: 'tracking' };
  for (const [k, v] of Object.entries(root.typography)) {
    if (typeof v !== 'object') { problems.push(`typography.${k} should be a map`); continue; }
    for (const [p, val] of Object.entries(v)) {
      if (props[p]) add(`${props[p]}-${slug(k)}`, val, `typography.${k}.${p}`);
    }
  }
}
flat('spacing', 'space');
flat('rounded', 'radius');
flat('shadows', 'shadow');

if (problems.length) fail('\n  ' + problems.join('\n  '));
if (!lines.length) fail('no tokens found (expected colors, typography, spacing, rounded)');

const css = `/* Generated from ${path.basename(src)} by tokens.cjs. Edit DESIGN.md, then regenerate. */\n:root {\n${lines.join('\n')}\n}\n`;

if (check) {
  if (!outPath) fail('--check needs --out <file>');
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8').replace(/\r\n/g, '\n') : null;
  if (current === css) { console.log(`tokens: ${outPath} is up to date`); process.exit(0); }
  console.log(`tokens: ${outPath} is ${current === null ? 'missing' : 'out of date'}; run without --check to regenerate`);
  process.exit(1);
}
if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, css);
  console.log(`tokens: wrote ${lines.filter(l => l.includes('--')).length} variables to ${outPath}`);
} else {
  process.stdout.write(css);
}
