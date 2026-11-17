// Checks the content set against content/SCHEMA.md without building.
// Every build runs the same check (eleventy.config.js). Run with: npm run validate
import path from 'node:path';
import { ROOT, contentDir, validateContent } from '../lib/content.js';

const dir = contentDir();
const errors = validateContent(dir);
const where = path.relative(ROOT, dir).split(path.sep).join('/');

if (errors.length) {
  console.error(`Content in ${where}/ is invalid:`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
console.log(`Content in ${where}/ is valid.`);
