// Brings the Publications up to date with the ORCID records of the current
// Members (lib/update-publications.js) and prints what it found: new works,
// for the Maintainer to add with add-publication, Publications it updated,
// works it excluded, and works for the Maintainer to review. The
// update-publications skill runs it.
//
// Run it with: npm run update-publications (USAGE below says how).
import { parseArgs } from 'node:util';
import { repoPath } from '../lib/content.js';
import { CannotAdd } from '../lib/sources.js';
import { exclusionListFile, updatePublications } from '../lib/update-publications.js';

const USAGE = 'Usage: npm run update-publications [-- --since <year>]';

// "1 work", "2 works".
const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

// A part of the report: its heading, then one line per item.
const part = (heading, items) => [heading, ...items.map((item) => `  - ${item}`)];

function describe(report) {
  const { read, since, sinceIsDefault, older, notPapers } = report;
  const kinds = Object.entries(notPapers);
  const skippedOther = kinds.reduce((sum, [, n]) => sum + n, 0);
  return [
    read.length ? `Read the ORCID record${read.length === 1 ? '' : 's'} of ${count(read.length, 'Member')}: ${read.map((m) => m.name).join(', ')}.`
      : 'Read no ORCID record: no current Member\'s file in members/ has an orcid that ORCID holds.',
    ...(older ? [`Skipped ${count(older, 'work')} from before ${since}${sinceIsDefault ? ', the year publications_since in site.yaml sets: pass --since <year> to read further back' : ''}.`] : []),
    ...(skippedOther ? [`Skipped ${count(skippedOther, 'work')} that ${skippedOther === 1 ? 'is not a paper' : 'are not papers'} (${kinds.map(([kind, n]) => n === 1 ? kind : `${kind}: ${n}`).join(', ')}).`] : []),
    '',
    `New: ${report.found.length}. Not on the site yet; each needs its Research Area from the Maintainer.`,
    ...report.found.flatMap(({ citation, source, preprint, where }) => [
      `  - "${citation.title}" (${citation.status}, ${citation.venue}, ${citation.year}), ${where}.${preprint ? ` Its Preprint: ${preprint}` : ''}`,
      `    npm run add-publication -- ${source} --area <research-area>`,
    ]),
    ...part(`Updated: ${report.updated.length}.`, report.updated),
    ...part(`Excluded: ${report.excluded.length}, as ${repoPath(exclusionListFile())} lists.`, report.excluded),
    ...part(`Needs review: ${report.review.length}.`, report.review),
    `Already on the site, unchanged: ${report.unchanged}.`,
  ].join('\n');
}

try {
  const { values } = parseArgs({ options: { since: { type: 'string' } } });
  const since = values.since === undefined ? undefined : Number(values.since);
  if (since !== undefined && !/^\d{4}$/.test(values.since)) throw new CannotAdd(`--since takes a year, such as 2024, not "${values.since}".\n${USAGE}`);
  console.log(describe(await updatePublications({ since })));
} catch (e) {
  // A problem the Maintainer can fix is said plainly; anything else is a bug, shown whole.
  if (!(e instanceof CannotAdd) && e.code?.startsWith('ERR_PARSE_ARGS') !== true) throw e;
  console.error(`Cannot update the Publications: ${e.message}${e instanceof CannotAdd ? '' : `\n${USAGE}`}`);
  process.exit(1);
}
