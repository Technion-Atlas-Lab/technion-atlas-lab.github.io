// Adding a Publication to the content set from a citation (lib/sources.js,
// lib/bibtex.js): which authors are Members, whether the Lab already lists
// it, what its file is called, and the file itself. tools/add-publication.js
// uses it.
import fs from 'node:fs';
import yaml from 'js-yaml';
import {
  isItemName, loadMembers, loadPublications, loadResearchAreas, publicationFile, repoPath, validateContent, withoutTitle,
} from './content.js';
import { CannotAdd } from './sources.js';
import { comparable } from './text.js';

// A person's name as a key for matching, and its first and last words.
function nameKey(name) {
  const words = comparable(name).split(' ');
  return { key: words.join(' '), first: words[0], last: words.at(-1) };
}

// Each author as the file will list them: `entry` is `{ member: slug }` for
// the one Member or Alumnus of that name (`person`), and the name itself for
// anyone else. `maybe` holds the people the name could also mean: several
// people of that very name, or one with the same family name and first
// initial. A Member's name may open with a title, which a paper leaves out.
function matchAuthors(names, members) {
  const people = members.map((person) => ({ person, ...nameKey(withoutTitle(person.name)) }));
  return names.map((name) => {
    const author = nameKey(name);
    const namesakes = people.filter((candidate) => candidate.key === author.key);
    if (namesakes.length === 1) return { name, entry: { member: namesakes[0].person.slug }, person: namesakes[0].person, maybe: [] };
    const lookalikes = people.filter((candidate) => candidate.key !== author.key
      && candidate.last === author.last && candidate.first[0] === author.first[0]);
    return { name, entry: name, person: null, maybe: [...namesakes, ...lookalikes].map((candidate) => candidate.person) };
  });
}

// A file name from a title: its words before any subtitle, six at most.
function fileNameFrom(title) {
  const words = (text) => comparable(text).replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);
  const main = words(title.split(/: | [–—-] /)[0]);
  return (main.length > 1 ? main : words(title)).slice(0, 6).join('-');
}

// The Publication the Lab already lists with this DOI (in any case), arXiv
// page or title (in any spelling), as the path of its file and its title.
function alreadyListed(citation) {
  const sameId = (a, b) => Boolean(a && b) && a.toLowerCase() === b.toLowerCase();
  const sameTitle = (a, b) => Boolean(a && b) && comparable(a) === comparable(b);
  const listed = loadPublications().find((publication) => sameId(publication.doi, citation.doi)
    || sameId(publication.arxiv, citation.arxiv) || sameTitle(publication.title, citation.title));
  return listed && { path: repoPath(publicationFile(listed.slug)), title: listed.title };
}

// Stops when the Lab already lists a Publication with this DOI; the command
// asks before it asks Crossref anything.
export function refuseListedDoi(doi) {
  const listed = alreadyListed({ doi });
  if (listed) throw new CannotAdd(`${listed.path} already has the DOI ${doi}: the Lab lists this Publication. Edit that file instead`);
}

// Stops unless `slug` is a Research Area, listing the areas there are.
function requireResearchArea(slug) {
  const areas = loadResearchAreas();
  if (areas.some((area) => area.slug === slug)) return;
  const list = areas.map((area) => `  ${area.slug}  (${area.title})`).join('\n');
  throw new CannotAdd(`${slug ? `there is no Research Area "${slug}"` : 'the Publication needs its Research Area'}. `
    + `The Maintainer chooses one; pass it as --area <name>:\n${list}`);
}

// Writes the Publication's file and gives back where it is (`file`) and how
// each author was written (`authors`). Stops, writing nothing, when a detail
// is missing, the Lab already lists the Publication, or the file would not
// pass validation.
export function addPublication(citation, { area, name }) {
  for (const field of ['title', 'venue', 'year']) {
    if (!citation[field]) throw new CannotAdd(`the source gives no ${field} for this Publication. Give the Publication as a BibTeX entry instead, with its ${field}`);
  }
  if (!citation.authors.length) throw new CannotAdd('the source names no authors for this Publication. Give the Publication as a BibTeX entry instead, with its authors');
  requireResearchArea(area);
  const listed = alreadyListed(citation);
  if (listed) throw new CannotAdd(`${listed.path} is already this Publication ("${listed.title}"). Edit that file instead`);

  const slug = name ?? fileNameFrom(citation.title);
  if (!isItemName(slug)) throw new CannotAdd(`"${slug}" cannot be a file name: use lowercase letters, digits and hyphens, and pass it as --name <file-name>`);
  const file = publicationFile(slug);
  if (fs.existsSync(file)) throw new CannotAdd(`${repoPath(file)} already exists. Pass another file name as --name <file-name>`);

  const authors = matchAuthors(citation.authors, loadMembers());
  // In the order content/SCHEMA.md lists the fields.
  const fields = {
    title: citation.title,
    authors: authors.map((author) => author.entry),
    venue: citation.venue,
    year: citation.year,
    research_area: area,
    status: citation.status,
    ...Object.fromEntries(['doi', 'paper', 'arxiv'].filter((link) => citation[link]).map((link) => [link, citation[link]])),
  };
  const front = yaml.dump(fields, { schema: yaml.CORE_SCHEMA, lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(file, `---\n${front}---\n`);

  // The file must be one the build accepts; a file it would refuse is taken back.
  const problems = validateContent().filter((problem) => problem.startsWith(`${repoPath(file)}:`));
  if (problems.length) {
    fs.rmSync(file);
    throw new CannotAdd(`the Publication's file would not be valid, so nothing was written:\n${problems.map((p) => `  x ${p}`).join('\n')}`);
  }
  return { file, authors };
}
