// Reads a file holding one BibTeX entry as a citation, the shape
// lib/sources.js describes, with its LaTeX turned into plain text.
// tools/add-publication.js uses it.
import { PREPRINT_STATUS, PUBLISHED_STATUS } from './content.js';
import { arxivId, arxivLink, CannotAdd, doiIn } from './sources.js';
import { plainText } from './text.js';

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

// The fields of one entry, from the text between its braces: `name = value`,
// each value in braces, in double quotes or bare, as written.
function fieldsIn(body) {
  const fields = {};
  const name = /[\s,]*([\w-]+)\s*=\s*/y;
  name.lastIndex = body.indexOf(',');
  for (let match = name.exec(body); match; match = name.exec(body)) {
    const start = name.lastIndex;
    let end;
    if (body[start] === '{') end = closingBrace(body, start) + 1 || body.length;
    else if (body[start] === '"') end = body.indexOf('"', start + 1) + 1 || body.length;
    else end = (body.indexOf(',', start) + 1 || body.length + 1) - 1;
    const quoted = '{"'.includes(body[start]);
    fields[match[1].toLowerCase()] = quoted ? body.slice(start + 1, end - 1) : body.slice(start, end);
    name.lastIndex = end;
  }
  return fields;
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
const fromLatex = (value) => plainText(value
  .replace(/\\([`'^~"=.])\s*\{?\\?([a-zA-Z])\}?/g, (_, accent, letter) => letter + ACCENTS[accent])
  .replace(/\\([cvuHkr])\s*\{\\?([a-zA-Z])\}/g, (_, accent, letter) => letter + ACCENTS[accent])
  .replace(/\\(ss|ae|AE|aa|AA|[oOlLij])(?![a-zA-Z])\s*/g, (_, letter) => LETTERS[letter])
  .replace(/\\([&%_#$])/g, '$1')
  .replace(/~/g, ' ')
  .replace(/--+/g, '–')
  .replace(/[{}]/g, ''))
  .normalize('NFC');

// "Family, Given" and "Family, Jr, Given" as the name is read aloud.
function nameInOrder(name) {
  const [family, ...rest] = name.split(',').map((part) => part.trim());
  return [rest.at(-1), family, ...rest.slice(0, -1)].filter(Boolean).join(' ');
}

// The citation in the BibTeX file `text`; `source` is how messages name the file.
export function bibtexCitation(text, source) {
  const entries = entriesIn(text);
  if (entries.length !== 1) throw new CannotAdd(`${source} holds ${entries.length} BibTeX entries: give a file with exactly one, as the command adds one Publication at a time`);
  const [raw] = entries;
  const fields = Object.fromEntries(Object.entries(raw).map(([name, value]) => [name, fromLatex(value)]));
  const missing = (what) => new CannotAdd(`${source}: the BibTeX entry has no ${what}. Add it to the entry and run the command again`);

  const names = (raw.author ?? '').split(/\s+and\s+/).map((name) => nameInOrder(fromLatex(name))).filter(Boolean);
  const authors = names.filter((name) => name !== 'others');
  const notes = [];
  if (authors.length < names.length) notes.push('the BibTeX entry cuts its authors short with "and others": add the missing authors to the file by hand');

  // arXiv's id is in `eprint`, in a link, or in a journal field such as
  // "arXiv preprint arXiv:2603.01234", which is no venue of its own.
  const journal = /^arxiv\b/i.test(fields.journal ?? '') ? null : fields.journal;
  const arxiv = arxivId(`arXiv:${fields.eprint ?? ''}`) ?? arxivId(fields.journal ?? '') ?? arxivId(fields.url ?? '');
  const reviewedVenue = journal ?? fields.booktitle;
  const venue = reviewedVenue ?? (arxiv ? 'arXiv' : fields.school ?? fields.institution ?? fields.publisher ?? fields.howpublished);
  const year = Number(/\d{4}/.exec(fields.year ?? fields.date ?? '')?.[0]);
  const doi = doiIn(fields.doi ?? '');

  if (!fields.title) throw missing('title');
  if (!authors.length) throw missing('author');
  if (!venue) throw missing('venue: a journal, a booktitle, an arXiv eprint, a school or a publisher');
  if (!year) throw missing('year');
  for (const field of ['title', 'venue']) {
    if (/[\\$]/.test({ title: fields.title, venue }[field])) notes.push(`the ${field} still holds LaTeX: rewrite it in the file as plain text`);
  }
  return {
    title: fields.title,
    authors,
    venue,
    year,
    status: arxiv && !reviewedVenue ? PREPRINT_STATUS : PUBLISHED_STATUS,
    ...(doi && { doi }),
    ...(!doi && !arxiv && /^https:\/\/\S+$/.test(fields.url ?? '') && { paper: fields.url }),
    ...(arxiv && { arxiv: arxivLink(arxiv) }),
    notes,
  };
}
