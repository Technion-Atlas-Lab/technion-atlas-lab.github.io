// The content set: where it lives, how to read it, and whether it is valid.
//
// The build reads content/ unless SITE_CONTENT_DIR points elsewhere; the slice
// tests point it at tests/content/ so real content never affects them.
//
// SCHEMA below is the single source of truth for validation; content/SCHEMA.md
// documents the same rules for people and agents. Change both together.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export const ROOT = path.resolve(import.meta.dirname, '..');

export function contentDir() {
  return path.resolve(ROOT, process.env.SITE_CONTENT_DIR ?? 'content');
}

// type -> { file, required: {field: kind}, optional: {field: kind} }
// kinds: text (plain text, no HTML) | email | site-address (https://host, nothing after it)
const SCHEMA = {
  site: {
    file: 'site.yaml',
    required: { name: 'text', full_name: 'text', mission: 'text', mailbox: 'email', url: 'site-address' },
    optional: {},
  },
};

export function loadSiteSettings() {
  return yaml.load(fs.readFileSync(path.join(contentDir(), SCHEMA.site.file), 'utf8'));
}

// Returns one message per problem, each starting with the file it is in.
export function validateContent(dir = contentDir()) {
  const errors = [];
  for (const def of Object.values(SCHEMA)) {
    const file = path.join(dir, def.file);
    const err = (msg) => errors.push(`${repoPath(file)}: ${msg}`);
    if (!fs.existsSync(file)) {
      err('file is missing');
      continue;
    }
    let data;
    try {
      data = yaml.load(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      err(`does not parse as YAML: ${e.message}`);
      continue;
    }
    checkFields(data, def, err);
  }
  return errors;
}

// The report a person reads when validation fails.
export function describeErrors(errors, dir = contentDir()) {
  return [`Content in ${repoPath(dir)}/ is invalid:`, ...errors.map((e) => `  x ${e}`)].join('\n');
}

export const repoPath = (file) => path.relative(ROOT, file).split(path.sep).join('/');

function checkFields(data, def, err) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return err('expected a mapping of field: value');
  }
  for (const field of Object.keys(def.required)) {
    if (!Object.hasOwn(data, field)) err(`missing required field "${field}"`);
  }
  for (const [field, value] of Object.entries(data)) {
    const kind = Object.hasOwn(def.required, field) ? def.required[field]
      : Object.hasOwn(def.optional, field) ? def.optional[field]
      : null;
    if (!kind) err(`unknown field "${field}"`);
    else checkValue(field, kind, value, err);
  }
}

function checkValue(field, kind, value, err) {
  if (typeof value !== 'string' || value.trim() === '') {
    return err(`field "${field}" must be non-empty text`);
  }
  if (/<[a-zA-Z/][^>]*>/.test(value)) return err(`field "${field}" must be plain text, not HTML`);
  if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    err(`field "${field}" must be an email address`);
  }
  if (kind === 'site-address' && !/^https:\/\/[a-z0-9.-]+$/i.test(value)) {
    err(`field "${field}" must be the site's https address with nothing after the host, like https://example.org`);
  }
}
