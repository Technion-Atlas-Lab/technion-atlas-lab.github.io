// Bringing the Publications up to date with the ORCID records of the current
// Members: reads each record, matches its works to the Publications the Lab
// lists, adds to a listed Publication a DOI or arXiv link it lacks, and sorts
// the rest into new works, excluded works and works for the Maintainer to
// review. It writes no new Publication: each needs its Research Area, which
// only the Maintainer can assign, so the update-publications skill adds it
// with add-publication. tools/update-publications.js runs it and prints what
// it found.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ALUMNUS_ROLE, contentDir, loadMembers, loadPublications, loadSiteSettings, PREPRINT_STATUS, PUBLISHED_STATUS, publicationFile, repoPath } from './content.js';
import { addFields, findListed, matchAuthors, sameDoi, sameTitle } from './publications.js';
import { arxivCitation, arxivId, arxivLink, CannotAdd, crossrefCitation, doiIn, orcidWorks, PAPER_TYPES } from './sources.js';

// The exclusion list: the works the Lab does not list though an ORCID record
// credits them to a Member. Only the Maintainer adds to it.
export const exclusionListFile = () => path.join(contentDir(), 'excluded-publications.yaml');

const EXCLUSION_IDS = ['doi', 'arxiv', 'title'];

// The exclusion list's entries, each naming one work by `doi`, `arxiv` (an
// id) or `title`, with its `reason`. Stops on an entry it cannot read, so a
// work is never listed for want of a typo fixed.
function loadExclusions() {
  const file = exclusionListFile();
  if (!fs.existsSync(file)) return [];
  const where = repoPath(file);
  let entries;
  try {
    entries = yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.CORE_SCHEMA }) ?? [];
  } catch (e) {
    throw new CannotAdd(`${where} does not parse as YAML: ${e.message}`);
  }
  if (!Array.isArray(entries)) throw new CannotAdd(`${where} must be a list, each entry opening with "- "`);
  return entries.map((entry, i) => {
    const problem = (message) => new CannotAdd(`${where}: entry ${i + 1} ${message}`);
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) throw problem('must be fields: a doi, arxiv or title, and a reason');
    const unknown = Object.keys(entry).find((field) => ![...EXCLUSION_IDS, 'reason'].includes(field));
    if (unknown) throw problem(`has the unknown field "${unknown}"`);
    const ids = EXCLUSION_IDS.filter((field) => Object.hasOwn(entry, field));
    if (ids.length !== 1) throw problem('must name its work by exactly one of doi, arxiv or title');
    if (typeof entry.reason !== 'string' || !entry.reason.trim()) throw problem('needs a "reason": why the Lab does not list the work');
    const [field] = ids;
    // Unquoted, YAML reads an arXiv id as a number and drops its trailing zeros.
    if (typeof entry[field] !== 'string') throw problem(`needs its ${field} in quotes`);
    const value = { doi: doiIn, arxiv: arxivId, title: (title) => title.trim() || null }[field](entry[field]);
    if (!value) throw problem(`has a ${field} that is not one: "${entry[field]}"`);
    return { [field]: value, reason: entry.reason.trim() };
  });
}

// Whether two works are one: by DOI when both have one, else by arXiv id when
// both have one, else by title.
function sameWork(a, b) {
  if (a.doi && b.doi) return sameDoi(a.doi, b.doi);
  if (a.arxiv && b.arxiv) return a.arxiv === b.arxiv;
  return sameTitle(a.title, b.title);
}

// Adds `work` to `works`, merging it into the work it is, if any: that work
// gains the ids, citation and Members it lacked.
function addWork(works, work) {
  const same = works.find((other) => sameWork(other, work));
  if (!same) {
    works.push(work);
    return;
  }
  for (const field of ['doi', 'arxiv', 'year', 'citation', 'listed', 'problem']) same[field] ??= work[field];
  // A copy that could not be looked up does not count against one that was.
  if (same.citation) delete same.problem;
  same.members = [...same.members, ...work.members.filter((m) => !same.members.includes(m))];
}

// Names as a sentence lists them: "A", "A and B", "A, B and C".
const nameList = (names) => names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
const inRecords = (work) => `in the record${work.members.length > 1 ? 's' : ''} of ${nameList(work.members.map((m) => m.name))}`;

// How a report names a work: its title, and its DOI, arXiv page or year.
const named = (work) => `"${work.citation?.title ?? work.title}" (${work.doi ?? (work.arxiv && arxivLink(work.arxiv)) ?? work.year})`;

// Reads the records and updates the Publications. `since` is the first year
// a new work may be from; by default the year `publications_since` in the
// Site settings gives. Gives back
// the report: the Members whose records were `read`; the works `found` new,
// each with its `citation`, the `source` to add it from, its `preprint` on
// arXiv and `where` it was listed; and, as sentences, the works `updated`,
// `excluded` and left for `review`; and how many were `unchanged`, `older`
// than `since`, and not papers (`notPapers`, by kind).
export async function updatePublications({ since } = {}) {
  const exclusions = loadExclusions();
  const publications = loadPublications();
  const everyone = loadMembers();
  const firstYear = since ?? loadSiteSettings().publications_since;
  const report = {
    since: firstYear, sinceIsDefault: since === undefined,
    read: [], found: [], updated: [], excluded: [], review: [], unchanged: 0, older: 0, notPapers: {},
  };

  // Works on the exclusion list leave `works`, reported with their reasons.
  const exclude = () => {
    works = works.filter((work) => {
      const exclusion = findListed(exclusions, work);
      if (exclusion) report.excluded.push(`${named(work)}: ${exclusion.reason}`);
      return !exclusion;
    });
  };

  let works = [];
  for (const member of everyone.filter((person) => person.orcid && person.role !== ALUMNUS_ROLE)) {
    let record;
    try {
      record = await orcidWorks(member.orcid);
    } catch (e) {
      if (!(e instanceof CannotAdd)) throw e;
      report.review.push(`${e.message}: check the orcid in members/${member.slug}.md.`);
      continue;
    }
    report.read.push(member);
    for (const work of record) {
      if (PAPER_TYPES.includes(work.type)) addWork(works, { ...work, members: [member] });
      else report.notPapers[work.type] = (report.notPapers[work.type] ?? 0) + 1;
    }
  }
  exclude();

  // A work the Lab lists is matched whatever its year; one it does not list
  // is skipped when older than `since`, as the Lab's work began then.
  for (const work of works) work.listed = findListed(publications, work);
  works = works.filter((work) => {
    const older = !work.listed && work.year && work.year < firstYear;
    if (older) report.older += 1;
    return !older;
  });

  // Only a work the Lab does not list, or lists as a Preprint, is looked up:
  // the Lab's own files are never checked against a source, so a Maintainer's
  // fix stays. Crossref is asked once for a DOI two works share.
  const crossrefAnswers = new Map();
  const crossref = (doi) => {
    if (!crossrefAnswers.has(doi.toLowerCase())) crossrefAnswers.set(doi.toLowerCase(), crossrefCitation(doi));
    return crossrefAnswers.get(doi.toLowerCase());
  };
  for (const work of works.filter((w) => !w.listed || w.listed.status === PREPRINT_STATUS)) {
    try {
      work.citation = await lookUp(work, crossref);
    } catch (e) {
      if (!(e instanceof CannotAdd)) throw e;
      work.problem = e.message;
    }
  }
  // A Preprint arXiv links to its published version is now known by that
  // version's DOI, which may be another work's, or on the exclusion list.
  const lookedUp = works;
  works = [];
  for (const work of lookedUp) addWork(works, work);
  exclude();

  for (const work of works) {
    work.listed ??= work.citation && findListed(publications, { ...work.citation, arxiv: work.arxiv });
    if (work.listed) mergeListed(work, report);
    else if (work.problem) report.review.push(`${named(work)}, ${inRecords(work)}: ${work.problem}.`);
    else if (!work.citation) report.review.push(`${named(work)}, ${inRecords(work)}, has no DOI or arXiv id: if it is the Lab's, add it from a BibTeX entry.`);
    else if (!byAnyOf(work, everyone)) {
      const names = work.members.map((member) => member.name);
      const lists = names.length === 1 ? `the ORCID record of ${names[0]} lists it, but ${names[0]} is not` : `the ORCID records of ${nameList(names)} list it, but none of them is`;
      report.review.push(`${named(work)}: ${lists} among its authors.`);
    } else {
      const { citation } = work;
      report.found.push({
        citation,
        source: citation.doi ?? citation.arxiv,
        preprint: citation.doi && work.arxiv ? arxivLink(work.arxiv) : null,
        where: inRecords(work),
      });
    }
  }
  return report;
}

// The citation for a work: Crossref's for its DOI, else arXiv's for its
// arXiv id, else none. A Preprint that arXiv says was published is the
// published version: the work takes that version's DOI, and its citation is
// read from Crossref.
async function lookUp(work, crossref) {
  if (work.doi) return crossref(work.doi);
  if (!work.arxiv) return null;
  const preprint = await arxivCitation(work.arxiv);
  if (!preprint.publishedDoi) return preprint;
  work.doi = preprint.publishedDoi;
  return crossref(work.doi);
}

// Whether a Member whose record lists the work is among its authors, by name
// or by a name that may be theirs.
function byAnyOf(work, everyone) {
  const authors = matchAuthors(work.citation.authors, everyone);
  return work.members.some((member) => authors.some((author) => author.person?.slug === member.slug
    || author.maybe.some((person) => person.slug === member.slug)));
}

// A work the Lab lists: a Preprint whose published version has appeared is
// flagged; otherwise the file gains the DOI and arXiv link it lacks. A field
// the file has is never changed: a different value is left for review.
function mergeListed(work, report) {
  const { listed, citation } = work;
  const file = repoPath(publicationFile(listed.slug));
  if (work.problem) report.review.push(`${file}, ${inRecords(work)}: ${work.problem}.`);
  if (listed.status === PREPRINT_STATUS && citation?.status === PUBLISHED_STATUS) {
    report.review.push(`${file} is a Preprint, and its published version has appeared: ${citation.venue}, ${citation.year}, DOI ${citation.doi}.`);
    return;
  }
  const fields = {};
  const differs = [];
  if (work.doi && listed.doi && !sameDoi(listed.doi, work.doi)) differs.push(`${file} has the DOI ${listed.doi}, and ORCID gives it ${work.doi}.`);
  else if (work.doi && listed.paper) differs.push(`${file} has a paper link, and ORCID gives it the DOI ${work.doi}: a file has one or the other, so the DOI was not added.`);
  else if (work.doi && !listed.doi) fields.doi = work.doi;
  if (work.arxiv && listed.arxiv && arxivId(listed.arxiv) !== work.arxiv) differs.push(`${file} links to the arXiv page ${listed.arxiv}, and ORCID gives it ${arxivLink(work.arxiv)}.`);
  else if (work.arxiv && !listed.arxiv) fields.arxiv = arxivLink(work.arxiv);
  report.review.push(...differs);
  if (Object.keys(fields).length) {
    try {
      addFields(listed.slug, fields);
      report.updated.push(`${file}: added ${Object.entries(fields).map(([field, value]) => `${field} ${value}`).join(', ')}`);
    } catch (e) {
      if (!(e instanceof CannotAdd)) throw e;
      report.review.push(e.message);
    }
  } else if (!differs.length && !work.problem) report.unchanged += 1;
}
