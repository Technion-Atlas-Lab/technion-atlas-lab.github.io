// Checks the content set against content/SCHEMA.md without building.
// Every build runs the same check (eleventy.config.js). Run with: npm run validate
import { contentDir, describeErrors, repoPath, validateContent } from '../lib/content.js';

const errors = validateContent();
if (errors.length) {
  console.error(describeErrors(errors));
  process.exit(1);
}
console.log(`Content in ${repoPath(contentDir())}/ is valid.`);
