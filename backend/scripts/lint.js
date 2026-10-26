import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['backend/src', 'backend/scripts', 'frontend/assets/js'];
const files = [];
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (/\.(js|mjs)$/.test(entry.name)) files.push(full); } }
roots.forEach(walk);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) { console.error(`${file}: ${result.stderr.trim()}`); failed = true; }
}
if (failed) process.exit(1);
console.log(`Syntax check passed for ${files.length} JavaScript files.`);
