import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const moduleDir = join(process.cwd(), 'src', 'modules');
const issues = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (extname(fullPath) !== '.ts') {
      continue;
    }

    const source = readFileSync(fullPath, 'utf8');
    if (source.trim().length === 0) {
      issues.push(`${fullPath}: file must not be empty`);
    }

    if (entry.endsWith('.modue.ts')) {
      issues.push(`${fullPath}: invalid module filename, expected *.module.ts`);
    }
  }
}

walk(moduleDir);

if (issues.length > 0) {
  console.error('Directory structure validation failed:');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Directory structure validation passed.');
