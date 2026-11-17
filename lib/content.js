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

// type -> { file, req: {field: kind}, opt: {field: kind} }
// kinds: string (plain text, no HTML) | email
const SCHEMA = {
  site: {
    file: 'site.yaml',
    req: { name: 'string', full_name: 'string', mission: 'string', mailbox: 'email' },
    opt: {},
  },
};

export function loadSiteSettings(dir = contentDir()) {
  return yaml.load(fs.readFileSync(path.join(dir, SCHEMA.site.file), 'utf8'));
}

// Returns one message per problem, each starting with the file it is in.
export function validateContent(dir = contentDir()) {
  const errors = [];
  for (const def of Object.values(SCHEMA)) {
    const full = path.join(dir, def.file);
    const err = (msg) => errors.push(`${displayPath(full)}: ${msg}`);
    if (!fs.existsSync(full)) {
      err('file is missing');
      continue;
    }
    let data;
    try {
      data = yaml.load(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      err(`does not parse as YAML: ${e.message}`);
      continue;
    }
    checkFields(data, def, err);
  }
  return errors;
}

function checkFields(data, def, err) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return err('expected a mapping of field: value');
  }
  for (const field of Object.keys(def.req)) {
    if (!(field in data)) err(`missing required field "${field}"`);
  }
  for (const [field, value] of Object.entries(data)) {
    const kind = def.req[field] ?? def.opt[field];
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
}

const displayPath = (file) => path.relative(ROOT, file).split(path.sep).join('/');
