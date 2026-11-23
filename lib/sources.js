// The services a Publication's details are read from: Crossref (by DOI) and
// arXiv (by arXiv id). This is the only place the tools reach the network.
// Each service answers with a citation: { title, authors (names, in order),
// venue, year, status, and the links it knows: doi, arxiv }.
//
// With RECORDED_RESPONSES naming a folder, every answer comes from that folder
// instead (tests/recorded/ says how it is laid out), so the tests stay on the
// machine. DBLP is not a source: it blocks scripted clients
// (docs/research/agent-tooling-survey.md).
import fs from 'node:fs';
import path from 'node:path';
import { PREPRINT_STATUS, PUBLISHED_STATUS, ROOT } from './content.js';
import { plainText } from './text.js';

// A problem the Maintainer can act on: the tool prints its message alone.
export class CannotAdd extends Error {}

const CROSSREF = 'https://api.crossref.org/works/';
const ARXIV = 'https://export.arxiv.org/api/query?id_list=';

// An arXiv id as arXiv writes it today (2603.01234) or before 2007 (hep-th/9901001).
const ARXIV_ID = /(\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?/;

// The arXiv id in a link, in "arXiv:2603.01234", in an arXiv DOI
// (10.48550/arXiv.2603.01234) or written alone; nothing when there is none.
export function arxivId(text) {
  const named = new RegExp(`arxiv(?:\\.org/(?:abs|pdf)/|[:.])${ARXIV_ID.source}`, 'i').exec(text);
  const alone = new RegExp(`^${ARXIV_ID.source}$`).exec(text);
  return (named ?? alone)?.[1] ?? null;
}

export const arxivLink = (id) => `https://arxiv.org/abs/${id}`;

// The DOI alone, from a DOI, "doi:10.1234/x" or a doi.org link; nothing when
// the text is none of them.
export function doiIn(text) {
  const doi = text.trim().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, '');
  return /^10\.\d{4,9}\/\S+$/.test(doi) ? doi : null;
}

// What `url` answers: its `status` and `text`.
async function get(url) {
  const recorded = process.env.RECORDED_RESPONSES;
  if (recorded) {
    const folder = path.resolve(ROOT, recorded);
    const answer = JSON.parse(fs.readFileSync(path.join(folder, 'index.json'), 'utf8'))[url];
    if (!answer) throw new CannotAdd(`${recorded}/index.json has no recorded response for ${url}`);
    return { status: answer.status, text: fs.readFileSync(path.join(folder, answer.file), 'utf8') };
  }
  try {
    // Both services ask a script to say what it is.
    const response = await fetch(url, { headers: { 'User-Agent': 'lab-website-tools' }, signal: AbortSignal.timeout(20000) });
    return { status: response.status, text: await response.text() };
  } catch (e) {
    throw new CannotAdd(`could not reach ${new URL(url).host}: ${e.cause?.message ?? e.message}`);
  }
}

// Crossref's types for work that has not been through a venue's review.
const CROSSREF_PREPRINT = 'posted-content';

// The first year among the dates Crossref may give a work.
function crossrefYear(work) {
  for (const field of ['issued', 'published', 'published-print', 'published-online', 'posted', 'created']) {
    const year = work[field]?.['date-parts']?.[0]?.[0];
    if (Number.isInteger(year)) return year;
  }
  return null;
}

// The citation Crossref holds for a DOI.
export async function crossrefCitation(doi) {
  const { status, text } = await get(CROSSREF + encodeURIComponent(doi));
  if (status === 404) throw new CannotAdd(`Crossref has no work with the DOI ${doi}. Check the DOI; for a paper Crossref does not hold, give its BibTeX entry instead`);
  if (status !== 200) throw new CannotAdd(`Crossref answered ${status} for the DOI ${doi}; try again later`);
  const work = JSON.parse(text).message;
  const isPreprint = work.type === CROSSREF_PREPRINT;
  return {
    title: plainText(work.title?.[0] ?? ''),
    // A person has a given and a family name; a group has one name.
    authors: (work.author ?? []).map((a) => plainText(a.name ?? [a.given, a.family].filter(Boolean).join(' '))).filter(Boolean),
    venue: plainText(work['container-title']?.[0] ?? work.event?.name ?? work.institution?.[0]?.name ?? work.publisher ?? ''),
    year: crossrefYear(work),
    status: isPreprint ? PREPRINT_STATUS : PUBLISHED_STATUS,
    // As Crossref writes it, which may differ in case from what was typed.
    doi: work.DOI ?? doi,
  };
}

// The citation arXiv holds for an arXiv id: always a Preprint.
export async function arxivCitation(id) {
  const { status, text } = await get(ARXIV + id);
  if (status !== 200) throw new CannotAdd(`arXiv answered ${status} for ${id}; try again later`);
  const entry = /<entry>([\s\S]*?)<\/entry>/.exec(text)?.[1];
  if (!entry) throw new CannotAdd(`arXiv has no paper with the id ${id}. Check the link`);
  const field = (name) => plainText(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(entry)?.[1] ?? '');
  return {
    title: field('title'),
    authors: [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => plainText(m[1])).filter(Boolean),
    venue: 'arXiv',
    year: Number(field('published').slice(0, 4)) || null,
    status: PREPRINT_STATUS,
    arxiv: arxivLink(id),
  };
}
