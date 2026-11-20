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

// The roles a Member can hold, in the order the People page shows them.
export const MEMBER_ROLES = ['Lab Director', 'Postdoctoral Researcher', 'PhD Student', 'MSc Student', 'Research Staff'];
export const ALUMNUS_ROLE = 'Alumnus';

// Fields only an Alumnus has.
const ALUMNUS_FIELDS = ['former_role', 'year', 'current_position'];

// type -> where it lives, and { required: {field: kind}, optional: {field: kind} }.
//   file: one YAML file.
//   dir:  a folder of Markdown files, one item each: YAML front matter between
//         `---` lines, then a plain-text body the type may name (`body`).
// CHECKS below says what each kind accepts.
const SCHEMA = {
  site: {
    file: 'site.yaml',
    required: { name: 'text', full_name: 'text', mission: 'text', mailbox: 'email', url: 'site-address' },
    optional: {},
  },
  member: {
    dir: 'members',
    required: { name: 'text', role: 'role', order: 'whole-number' },
    optional: {
      email: 'email',
      phone: 'phone',
      orcid: 'orcid',
      research_interests: 'text-list',
      google_scholar: 'link',
      dblp: 'link',
      github: 'link',
      linkedin: 'link',
      website: 'link',
      former_role: 'member-role',
      year: 'year',
      current_position: 'text',
    },
    body: 'bio',
    // Rules that span fields: what an Alumnus must have, and only an Alumnus may.
    also(data, err) {
      if (data.role === ALUMNUS_ROLE) {
        for (const field of ['former_role', 'year']) {
          if (!Object.hasOwn(data, field)) err(`missing field "${field}", required for an Alumnus`);
        }
      } else {
        for (const field of ALUMNUS_FIELDS) {
          if (Object.hasOwn(data, field)) err(`field "${field}" is only for a Member whose role is Alumnus`);
        }
      }
    },
  },
};

const HAS_HTML = /<[a-zA-Z/][^>]*>/;
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const oneOf = (choices) => `must be one of: ${choices.join(', ')}`;

// kind -> the problem with a value, or nothing when it is fine. The text-based
// kinds are checked as text first (TEXT_KINDS).
const CHECKS = {
  text: () => null,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'must be an email address',
  'site-address': (v) => /^https:\/\/[a-z0-9.-]+$/i.test(v) ? null
    : "must be the site's https address with nothing after the host, like https://example.org",
  link: (v) => /^https:\/\/\S+$/.test(v) && URL.canParse(v) ? null : 'must be a web address starting with https://',
  // A leading + keeps the number diallable from any country.
  phone: (v) => /^\+[0-9](?:[ -]?[0-9]){6,14}$/.test(v) ? null
    : 'must be a phone number in international form, like +972 4 000 0000',
  orcid: (v) => /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v) ? null
    : 'must be an ORCID iD, like 0000-0002-1825-0097 (the iD alone, not a web address)',
  role: (v) => [...MEMBER_ROLES, ALUMNUS_ROLE].includes(v) ? null : oneOf([...MEMBER_ROLES, ALUMNUS_ROLE]),
  'member-role': (v) => MEMBER_ROLES.includes(v) ? null : oneOf(MEMBER_ROLES),
  'whole-number': (v) => Number.isInteger(v) ? null : 'must be a whole number',
  year: (v) => Number.isInteger(v) && v >= 1900 && v <= 2100 ? null : 'must be a four-digit year, like 2024',
  'text-list': (v) => {
    if (!Array.isArray(v) || v.length === 0 || !v.every(isText)) return 'must be a list of non-empty text items';
    return v.some((item) => HAS_HTML.test(item)) ? 'must be plain text, not HTML' : null;
  },
};
const TEXT_KINDS = ['text', 'email', 'site-address', 'link', 'phone', 'orcid', 'role', 'member-role'];

export function loadSiteSettings() {
  return yaml.load(fs.readFileSync(path.join(contentDir(), SCHEMA.site.file), 'utf8'));
}

// Every Member and Alumnus, by display order and then by name. Each has its
// fields, a `slug` (its file name) and its `bio` as a list of paragraphs.
export function loadMembers() {
  return itemFiles(contentDir(), SCHEMA.member)
    .map((file) => {
      const { data, body } = splitFrontMatter(fs.readFileSync(file, 'utf8'));
      return { ...data, slug: path.basename(file, '.md'), bio: paragraphs(body) };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'en'));
}

// Returns one message per problem, each starting with the file it is in.
export function validateContent(dir = contentDir()) {
  const errors = [];
  for (const def of Object.values(SCHEMA)) {
    const files = def.file ? [path.join(dir, def.file)] : itemFiles(dir, def, { any: true });
    for (const file of files) {
      const err = (msg) => errors.push(`${repoPath(file)}: ${msg}`);
      if (!fs.existsSync(file)) {
        err('file is missing');
        continue;
      }
      if (def.dir && !/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(path.basename(file))) {
        err('file name must be lowercase letters, digits and hyphens, ending in .md, like member-name.md');
        continue;
      }
      let data;
      let body = '';
      try {
        const text = fs.readFileSync(file, 'utf8');
        if (def.dir) ({ data, body } = splitFrontMatter(text));
        else data = yaml.load(text);
      } catch (e) {
        err(`does not parse as YAML: ${e.message}`);
        continue;
      }
      checkFields(data, def, err);
      if (body.trim() && !def.body) err('text after the front matter is not used by this type');
      if (HAS_HTML.test(body)) err(`the ${def.body ?? 'text'} after the front matter must be plain text, not HTML`);
    }
  }
  return errors;
}

// The report a person reads when validation fails.
export function describeErrors(errors, dir = contentDir()) {
  return [`Content in ${repoPath(dir)}/ is invalid:`, ...errors.map((e) => `  x ${e}`)].join('\n');
}

export const repoPath = (file) => path.relative(ROOT, file).split(path.sep).join('/');

// The files of a one-file-per-item type, in name order. A type with no folder
// yet has no items. `any` also lists files that are not Markdown items, so
// validation can name them.
function itemFiles(dir, def, { any = false } = {}) {
  const folder = path.join(dir, def.dir);
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (any || entry.name.endsWith('.md')))
    .map((entry) => path.join(folder, entry.name))
    .sort();
}

// Splits `---` front matter from the body under it. Throws when the front
// matter is missing or is not YAML.
function splitFrontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/.exec(text);
  if (!match) throw new Error('the file must open with front matter between two --- lines');
  return { data: yaml.load(match[1]), body: match[2] ?? '' };
}

// Plain text as paragraphs: blank lines separate them.
const paragraphs = (text) => text.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

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
  def.also?.(data, err);
}

function checkValue(field, kind, value, err) {
  if (TEXT_KINDS.includes(kind)) {
    if (!isText(value)) return err(`field "${field}" must be non-empty text`);
    if (HAS_HTML.test(value)) return err(`field "${field}" must be plain text, not HTML`);
  }
  const problem = CHECKS[kind](value);
  if (problem) err(`field "${field}" ${problem}`);
}
