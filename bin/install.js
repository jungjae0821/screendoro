#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
  console.log(`Usage: npx github:jungjae0821/screendoro [options]

Options:
  --project      Install into ./.claude/skills instead of ~/.claude/skills
  --dir <path>   Install into <path>/screendoro
  -h, --help     Show this help`);
  process.exit(0);
}

let base = path.join(os.homedir(), '.claude', 'skills');
if (args.includes('--project')) {
  base = path.join(process.cwd(), '.claude', 'skills');
}
const dirIndex = args.indexOf('--dir');
if (dirIndex !== -1) {
  const value = args[dirIndex + 1];
  if (!value) {
    console.error('--dir needs a path');
    process.exit(1);
  }
  base = path.resolve(value);
}

const source = path.join(__dirname, '..', 'skills', 'screendoro');
const target = path.join(base, 'screendoro');

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(base, { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log(`screendoro installed to ${target}`);
