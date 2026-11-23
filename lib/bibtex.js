// Reads a file holding one BibTeX entry as a citation, the shape
// lib/sources.js describes, with its LaTeX turned into plain text.
// tools/add-publication.js uses it.
import { PREPRINT_STATUS, PUBLISHED_STATUS } from './content.js';
import { arxivId, arxivLink, CannotAdd, doiIn } from './sources.js';
import { oneLine } from './text.js';

// BibTeX blocks that are not entries.
const NOT_ENTRIES = ['comment', 'string', 'preamble'];

// Where the brace opened at `open` closes; -1 when it never does.
function closingBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '\\') i += 1;
    else if (text[i] === '{') depth += 1;
    else if (text[i] === '}' && (depth -= 1) === 0) return i;
  }
  return -1;
}

// Where the double quote opened at `open` closes: the next one outside braces
// (an accent inside quotes, {\"u}, is in braces); -1 when it never does.
function closingQuote(text, open) {
  let depth = 0;
  for (let i = open + 1; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') depth -= 1;
    else if (text[i] === '"' && depth === 0) return i;
  }
  return -1;
}

// The fields of one entry, from the text between its braces: `name = value`,
// each value as written, without the braces or double quotes around it.
// `abbreviations` names the fields whose value is a bare word: an
// abbreviation defined elsewhere (@string), not the text itself.
function fieldsIn(body) {
  const fields = {};
  const abbreviations = [];
  const name = /[\s,]*([\w-]+)\s*=\s*/y;
  name.lastIndex = body.indexOf(',');
  for (let match = name.exec(body); match; match = name.exec(body)) {
    const field = match[1].toLowerCase();
    const start = name.lastIndex;
    const close = { '{': closingBrace, '"': closingQuote }[body[start]]?.(body, start);
    if (close === undefined) {
      const comma = body.indexOf(',', start);
      const end = comma === -1 ? body.length : comma;
      fields[field] = body.slice(start, end).trim();
      if (!/^\d+$/.test(fields[field])) abbreviations.push(field);
      name.lastIndex = end;
    } else {
      const end = close === -1 ? body.length : close;
      fields[field] = body.slice(start + 1, end);
      name.lastIndex = end + 1;
    }
  }
  return { fields, abbreviations };
}

// Every entry in a BibTeX file, as its fields.
function entriesIn(text) {
  const entries = [];
  const opening = /@([a-zA-Z]+)\s*\{/g;
  for (let match = opening.exec(text); match; match = opening.exec(text)) {
    const open = opening.lastIndex - 1;
    const close = closingBrace(text, open);
    if (close === -1) break;
    if (!NOT_ENTRIES.includes(match[1].toLowerCase())) entries.push(fieldsIn(text.slice(open + 1, close)));
    opening.lastIndex = close + 1;
  }
  return entries;
}

// LaTeX's accent commands, as the mark Unicode puts on the letter before it.
const ACCENTS = {
  '`': '̀', "'": '́', '^': '̂', '~': '̃', '"': '̈', '=': '̄', '.': '̇',
  c: '̧', v: '̌', u: '̆', H: '̋', k: '̨', r: '̊',
};
// LaTeX's commands for letters that are not an accented letter.
const LETTERS = { ss: 'ß', o: 'ø', O: 'Ø', l: 'ł', L: 'Ł', ae: 'æ', AE: 'Æ', aa: 'å', AA: 'Å', i: 'i', j: 'j' };

// A BibTeX value as plain text: accents as letters, grouping braces gone.
const fromLatex = (value) => oneLine(value
  .replace(/\\([`'^~"=.])\s*\{?\\?([a-zA-Z])\}?/g, (_, accent, letter) => letter + ACCENTS[accent])
  .replace(/\\([cvuHkr])(?:\s*\{\\?([a-zA-Z])\}|\s+([a-zA-Z]))/g, (_, accent, braced, bare) => (braced ?? bare) + ACCENTS[accent])
  .replace(/\\(ss|ae|AE|aa|AA|[oOlLij])(?![a-zA-Z])\s*/g, (_, letter) => LETTERS[letter])
  .replace(/\\([&%_#$])/g, '$1')
  .replace(/~/g, ' ')
  .replace(/--+/g, '–')
  .replace(/[{}]/g, ''))
  .normalize('NFC');

// A link or a DOI in a BibTeX value: as written, but for LaTeX's escapes.
const address = (value) => (value ?? '').replace(/\\([&%_#~])/g, '$1').replace(/[{}]/g, '').trim();

// Whether text read by fromLatex still holds LaTeX: a command, or maths.
const holdsLatex = (text) => /\\[a-zA-Z]|\$.*\$/.test(text);

// "Family, Given" and "Family, Jr, Given" as the name is read aloud.
function nameInOrder(name) {
  const [family, ...rest] = name.split(',').map((part) => part.trim());
  return [rest.at(-1), family, ...rest.slice(0, -1)].filter(Boolean).join(' ');
}

// The citation in the BibTeX file `text`; `source` is how messages name the file.
export function bibtexCitation(text, source) {
  const entries = entriesIn(text);
  if (entries.length !== 1) throw new CannotAdd(`${source} holds ${entries.length} BibTeX entries: give a file with exactly one, as the command adds one Publication at a time`);
  const [{ fields: raw, abbreviations }] = entries;
  const fields = Object.fromEntries(Object.entries(raw).map(([name, value]) => [name, fromLatex(value)]));
  const missing = (what) => new CannotAdd(`${source}: the BibTeX entry has no ${what}. Add it to the entry and run the command again`);

  const names = (raw.author ?? '').split(/\s+and\s+/).map((name) => nameInOrder(fromLatex(name))).filter(Boolean);
  const authors = names.filter((name) => name !== 'others');

  // arXiv's id is in `eprint` or in a link. A journal that is arXiv under
  // another name ("arXiv preprint arXiv:2603.01234", or CoRR, as DBLP calls
  // it) is no venue of its own.
  const journalIsArxiv = /^(?:arxiv\b|corr$)/i.test(fields.journal ?? '');
  const arxiv = arxivId(`arXiv:${address(raw.eprint)}`) ?? arxivId(journalIsArxiv ? fields.journal : '') ?? arxivId(address(raw.url));
  const reviewedVenue = (journalIsArxiv ? null : fields.journal) ?? fields.booktitle;
  const venueField = ['school', 'institution', 'publisher', 'howpublished'].find((field) => fields[field]);
  const venue = reviewedVenue ?? (arxiv ? 'arXiv' : fields[venueField]);
  const year = Number(/\d{4}/.exec(fields.year ?? fields.date ?? '')?.[0]);
  const doi = doiIn(address(raw.doi));
  const url = address(raw.url);

  if (!fields.title) throw missing('title');
  if (!authors.length) throw missing('author');
  if (!venue) throw missing('venue: a journal, a booktitle, an arXiv eprint, a school or a publisher');
  if (!year) throw missing('year');

  // What the Maintainer must look at: the file holds these as the entry had them.
  const notes = [];
  if (authors.length < names.length) notes.push('the BibTeX entry cuts its authors short with "and others": add the missing authors to the file by hand');
  const shown = { title: fields.title, venue, authors: authors.join(', ') };
  for (const [what, value] of Object.entries(shown)) {
    if (holdsLatex(value)) notes.push(`the ${what} still holds LaTeX (${value}): rewrite it in the file as plain text`);
  }
  const venueSource = reviewedVenue === fields.booktitle ? 'booktitle' : reviewedVenue ? 'journal' : venueField;
  for (const [what, field] of [['title', 'title'], ['venue', venueSource], ['authors', 'author']]) {
    if (abbreviations.includes(field)) notes.push(`the ${what} is written as "${raw[field]}", a BibTeX abbreviation: write it out in the file`);
  }
  return {
    title: fields.title,
    authors,
    venue,
    year,
    status: arxiv && !reviewedVenue ? PREPRINT_STATUS : PUBLISHED_STATUS,
    ...(doi && { doi }),
    ...(!doi && !arxiv && /^https:\/\/\S+$/.test(url) && { paper: url }),
    ...(arxiv && { arxiv: arxivLink(arxiv) }),
    notes,
  };
}
