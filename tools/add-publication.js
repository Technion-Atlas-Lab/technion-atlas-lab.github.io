// Adds a Publication to the content set from a DOI (read from Crossref), an
// arXiv link (read from arXiv) or a file holding one BibTeX entry, and says
// which authors it matched to Members. The add-publication skill runs it.
//
// Usage: npm run add-publication -- <DOI | arXiv link | file.bib> --area <research-area> [--name <file-name>]
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { bibtexCitation } from '../lib/bibtex.js';
import { ALUMNUS_ROLE, repoPath } from '../lib/content.js';
import { addPublication, refuseListedDoi } from '../lib/publications.js';
import { arxivCitation, arxivId, CannotAdd, crossrefCitation, doiIn } from '../lib/sources.js';

const USAGE = 'Usage: npm run add-publication -- <DOI | arXiv link | file.bib> --area <research-area> [--name <file-name>]';

// The citation behind what the Maintainer gave: a file is a BibTeX entry,
// anything of arXiv's goes to arXiv (Crossref does not hold arXiv's own
// DOIs), and any other DOI goes to Crossref.
async function citationFrom(source) {
  if (fs.existsSync(source) && fs.statSync(source).isFile()) return bibtexCitation(fs.readFileSync(source, 'utf8'), source);
  const arxiv = arxivId(source);
  if (arxiv) return arxivCitation(arxiv);
  const doi = doiIn(source);
  if (doi) {
    refuseListedDoi(doi);
    return crossrefCitation(doi);
  }
  throw new CannotAdd(`"${source}" is not a DOI, an arXiv link or a file with a BibTeX entry.\n${USAGE}`);
}

// One line per author: how the file lists them, and whom to check by hand.
function describeAuthor({ name, person, maybe }) {
  const file = (p) => `${p.name}, members/${p.slug}.md`;
  if (person) return `${name}: ${person.role === ALUMNUS_ROLE ? 'Alumnus' : 'Member'} (${file(person)})`;
  const check = maybe.length ? ` CHECK: may be ${maybe.map(file).join(' or ')}; if so, write "member: <file name>" in the file` : '';
  return `${name}: written as a name, not in members/.${check}`;
}

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { area: { type: 'string' }, name: { type: 'string' } },
  });
  if (positionals.length !== 1) throw new CannotAdd(USAGE);
  const citation = await citationFrom(positionals[0]);
  const { file, authors } = addPublication(citation, values);
  console.log([
    `Wrote ${repoPath(file)} (${citation.status}, ${citation.venue}, ${citation.year}).`,
    'Authors:',
    ...authors.map((author, i) => `  ${i + 1}. ${describeAuthor(author)}`),
    ...(citation.notes ?? []).map((note) => `CHECK: ${note}`),
  ].join('\n'));
} catch (e) {
  // A problem the Maintainer can fix is said plainly; anything else is a bug, shown whole.
  if (!(e instanceof CannotAdd) && e.code?.startsWith('ERR_PARSE_ARGS') !== true) throw e;
  console.error(`Cannot add the Publication: ${e.message}${e instanceof CannotAdd ? '' : `\n${USAGE}`}`);
  process.exit(1);
}
