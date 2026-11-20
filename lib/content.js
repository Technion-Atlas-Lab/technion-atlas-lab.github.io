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
const ALL_ROLES = [...MEMBER_ROLES, ALUMNUS_ROLE];

// A name that is safe in a web address: lowercase letters, digits and hyphens.
const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';

// Fields only an Alumnus has.
const ALUMNUS_FIELDS = ['former_role', 'year', 'current_position'];

// What a Publication's status can be; `preprint` gets the Preprint badge.
export const PREPRINT_STATUS = 'preprint';
const PUBLICATION_STATUSES = ['published', PREPRINT_STATUS];

// type -> where it lives, and { required: {field: kind}, optional: {field: kind} }.
//   file: one YAML file.
//   dir:  a folder of Markdown files, one item each: YAML front matter between
//         `---` lines, then a plain-text body the type may name (`body`) and
//         may require (`bodyRequired`). The folder also holds the pictures its
//         items name. `takenNames` are file names an item may not have.
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
      photo: 'photo',
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
    acrossFields(data, err) {
      if (data.role === ALUMNUS_ROLE) {
        for (const field of ['former_role', 'year']) {
          if (!Object.hasOwn(data, field)) err(`missing field "${field}", required for an Alumnus`);
        }
      } else {
        for (const field of ALUMNUS_FIELDS) {
          if (Object.hasOwn(data, field)) err(`field "${field}" is only for an Alumnus (role: Alumnus)`);
        }
      }
    },
  },
  researchArea: {
    dir: 'research-areas',
    required: { title: 'text', order: 'whole-number' },
    optional: {},
    body: 'description',
    bodyRequired: true,
    // The file name is the address of the area's section on the Research page
    // (/research/#file-name); these are addresses every page already uses.
    takenNames: ['main', 'site-menu'],
  },
  publication: {
    dir: 'publications',
    required: {
      title: 'text',
      authors: 'authors',
      venue: 'text',
      year: 'year',
      research_area: 'research-area',
      status: 'status',
    },
    optional: {
      doi: 'doi',
      paper: 'link',
      pdf: 'link',
      arxiv: 'link',
      code: 'link',
      video: 'link',
      figure: 'figure',
      figure_alt: 'text',
      featured: 'true-or-false',
    },
    body: 'summary',
    acrossFields(data, err) {
      const has = (field) => Object.hasOwn(data, field);
      // Both lead to the paper, and a card has one "Paper" link.
      if (has('doi') && has('paper')) err('field "paper" cannot be given together with "doi": keep one of them');
      if (has('figure') && !has('figure_alt')) err('missing field "figure_alt", required with a figure: say what the figure shows');
      if (has('figure_alt') && !has('figure')) err('field "figure_alt" describes a figure, but there is no "figure" field');
    },
  },
};

// The picture formats the build can resize (lib/photos.js).
const PICTURE_NAME = new RegExp(`^${SLUG}\\.(jpg|jpeg|png|webp)$`);
const ITEM_NAME = new RegExp(`^${SLUG}\\.md$`);
const ITEM_SLUG = new RegExp(`^${SLUG}$`);

const HAS_HTML = /<[a-zA-Z/][^>]*>/;
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const oneOf = (choices) => `must be one of: ${choices.join(', ')}`;

// A picture kept beside the item that names it: a Member's photo, a Publication's figure.
const pictureBeside = (noun) => (v, folder) => {
  if (!PICTURE_NAME.test(v)) {
    return `must be the name of a ${noun} beside this file, in lowercase letters, digits and hyphens, ending in .jpg, .jpeg, .png or .webp`;
  }
  return fs.existsSync(path.join(folder, v)) ? null : `names ${v}, but there is no such file beside this one`;
};

// Whether the content set of the item in `folder` has the item `slug` of another type.
const itemExists = (folder, def, slug) => ITEM_SLUG.test(slug) && fs.existsSync(path.join(folder, '..', def.dir, `${slug}.md`));

const AUTHORS_SHAPE = 'a name, or a Member or Alumnus written as "member: <their file name>"';

// kind -> the problem with a value (or a list of problems), or nothing when it
// is fine. The text-based kinds are checked as text first (TEXT_KINDS).
// `folder` is where the item's file is, for a kind that names another file.
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
  role: (v) => ALL_ROLES.includes(v) ? null : oneOf(ALL_ROLES),
  'member-role': (v) => MEMBER_ROLES.includes(v) ? null : oneOf(MEMBER_ROLES),
  'whole-number': (v) => Number.isInteger(v) ? null : 'must be a whole number',
  year: (v) => Number.isInteger(v) && v >= 1900 && v <= 2100 ? null : 'must be a four-digit year, like 2024',
  photo: pictureBeside('photo'),
  figure: pictureBeside('figure'),
  'true-or-false': (v) => typeof v === 'boolean' ? null : 'must be true or false',
  status: (v) => PUBLICATION_STATUSES.includes(v) ? null : oneOf(PUBLICATION_STATUSES),
  doi: (v) => /^10\.\d{4,9}\/\S+$/.test(v) ? null : 'must be the DOI alone, like 10.1234/example (not a web address)',
  'research-area': (v, folder) => itemExists(folder, SCHEMA.researchArea, v) ? null
    : `names the Research Area "${v}", but there is no ${SCHEMA.researchArea.dir}/${v}.md`,
  // In order. A Member or an Alumnus is named by their file, so the card can
  // link to the Profile; anyone else (a Collaborator) is written as a name.
  authors: (v, folder) => {
    if (!Array.isArray(v) || v.length === 0) return `must be a list of authors, each ${AUTHORS_SHAPE}`;
    return v.map((author, i) => {
      if (isText(author)) return HAS_HTML.test(author) ? `lists author ${i + 1} with HTML in the name; it must be plain text` : null;
      const isReference = typeof author === 'object' && author !== null
        && Object.keys(author).join() === 'member' && isText(author.member);
      if (!isReference) return `lists author ${i + 1} as neither ${AUTHORS_SHAPE}`;
      return itemExists(folder, SCHEMA.member, author.member) ? null
        : `names "${author.member}" as a Member or Alumnus, but there is no ${SCHEMA.member.dir}/${author.member}.md`;
    }).filter(Boolean);
  },
  'text-list': (v) => {
    if (!Array.isArray(v) || v.length === 0 || !v.every(isText)) return 'must be a list of non-empty text items';
    return v.some((item) => HAS_HTML.test(item)) ? 'must be plain text, not HTML' : null;
  },
};
const TEXT_KINDS = ['text', 'email', 'site-address', 'link', 'phone', 'orcid', 'role', 'member-role', 'photo', 'figure',
  'status', 'doi', 'research-area'];

export function loadSiteSettings() {
  return yaml.load(fs.readFileSync(path.join(contentDir(), SCHEMA.site.file), 'utf8'));
}

// Every Member and every Alumnus, by display order and then by name. Each has its
// fields, a `slug` (its file name), its `bio` as a list of paragraphs and,
// with a photo, `photoFile`: where the photo as committed is.
export function loadMembers() {
  return loadItems(SCHEMA.member)
    .map(({ data, slug, body, beside }) => ({ ...data, slug, bio: paragraphs(body), photoFile: beside(data.photo) }))
    .sort((a, b) => a.order - b.order || byText(a.name, b.name));
}

// Every Research Area, by its set order and then by title. Each has its
// fields, a `slug` (its file name) and its `description` as a list of paragraphs.
export function loadResearchAreas() {
  return loadItems(SCHEMA.researchArea)
    .map(({ data, slug, body }) => ({ ...data, slug, description: paragraphs(body) }))
    .sort((a, b) => a.order - b.order || byText(a.title, b.title));
}

// Every Publication, newest first; those of one year by title, as a Publication
// has no finer date. Each has its fields, a `slug` (its file name), its
// `summary` as a list of paragraphs and, with a figure, `figureFile`: where
// the figure as committed is.
export function loadPublications() {
  return loadItems(SCHEMA.publication)
    .map(({ data, slug, body, beside }) => ({ ...data, slug, summary: paragraphs(body), figureFile: beside(data.figure) }))
    .sort((a, b) => b.year - a.year || byText(a.title, b.title));
}

const byText = (a, b) => a.localeCompare(b, 'en');

// The items of a one-file-per-item type: each one's fields (`data`), file name
// (`slug`) and `body`, and `beside`: where a picture it names is.
function loadItems(def) {
  return itemFiles(contentDir(), def).map((file) => ({
    ...splitFrontMatter(fs.readFileSync(file, 'utf8')),
    slug: path.basename(file, '.md'),
    beside: (name) => name ? path.join(path.dirname(file), name) : null,
  }));
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
      if (def.dir && PICTURE_NAME.test(path.basename(file))) continue; // a picture an item names
      if (def.dir && !ITEM_NAME.test(path.basename(file))) {
        err('file name must be lowercase letters, digits and hyphens, ending in .md for an item (member-name.md) or in .jpg, .jpeg, .png or .webp for a picture');
        continue;
      }
      const slug = path.basename(file, '.md');
      if (def.takenNames?.includes(slug)) {
        err(`file name "${slug}" is taken: it would be this item's address on its page (#${slug}), which every page already uses for something else. Rename the file`);
      }
      let data;
      let body = '';
      try {
        const text = fs.readFileSync(file, 'utf8');
        if (def.dir) ({ data, body } = splitFrontMatter(text));
        else data = yaml.load(text);
      } catch (e) {
        err(e instanceof NoFrontMatter ? e.message : `does not parse as YAML: ${e.message}`);
        continue;
      }
      checkFields(data, def, err, path.dirname(file));
      if (body.trim() && !def.body) err('text after the front matter is not used by this type');
      if (!body.trim() && def.bodyRequired) err(`missing the ${def.body}: write it as plain text after the front matter`);
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
// yet has no items. `any` lists every file in the folder, so validation can
// name one that does not belong.
function itemFiles(dir, def, { any = false } = {}) {
  const folder = path.join(dir, def.dir);
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (any || entry.name.endsWith('.md')))
    .map((entry) => path.join(folder, entry.name))
    .sort();
}

class NoFrontMatter extends Error {}

// Splits `---` front matter from the body under it. Throws NoFrontMatter when
// there is none, and js-yaml's error when it is not YAML.
function splitFrontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/.exec(text);
  if (!match) throw new NoFrontMatter('the file must open with its fields between two --- lines');
  return { data: yaml.load(match[1]), body: match[2] ?? '' };
}

// Plain text as paragraphs: blank lines separate them.
const paragraphs = (text) => text.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

function checkFields(data, def, err, folder) {
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
    else checkValue(field, kind, value, err, folder);
  }
  def.acrossFields?.(data, err);
}

function checkValue(field, kind, value, err, folder) {
  if (TEXT_KINDS.includes(kind)) {
    if (!isText(value)) return err(`field "${field}" must be non-empty text`);
    if (HAS_HTML.test(value)) return err(`field "${field}" must be plain text, not HTML`);
  }
  for (const problem of [CHECKS[kind](value, folder) ?? []].flat()) err(`field "${field}" ${problem}`);
}
