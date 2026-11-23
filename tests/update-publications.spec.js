// The update-publications command (tools/update-publications.js) reads the
// ORCID record of each current Member who has an ORCID iD, merges what it
// finds into the Publications the Lab lists, and reports what is new, updated,
// excluded and left for review. Each test runs it at its command line on a
// copy of the test content set, with ORCID, Crossref and arXiv answered from
// the recorded responses in tests/recorded/, never the network.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// ORCID iDs the test content set does not give, added to the copy: a second
// current Member, an Alumnus (whose record is never read, so it has no
// recorded response) and a Member whose iD ORCID does not hold.
const EXTRA_ORCIDS = {
  'zoe-oneil.md': '0000-0002-0000-0002',
  'alumnus-example.md': '0000-0003-0000-0003',
  'bare-member.md': '0000-0000-0000-0000',
};

// Runs the command on a fresh copy of the test content set; `prepare(dir)`
// may change the copy first. Gives back its exit `status`, what it printed
// (`output`), and `file(name)`: the text of a file in the copy's
// publications/ folder.
function updatePublications(args, testInfo, prepare = () => {}) {
  const contentDir = path.join('.builds', 'update-publications', `${testInfo.testId}-${testInfo.retry}`);
  fs.rmSync(contentDir, { recursive: true, force: true });
  fs.cpSync('tests/content', contentDir, { recursive: true });
  for (const [member, orcid] of Object.entries(EXTRA_ORCIDS)) {
    const file = path.join(contentDir, 'members', member);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\n---\n?$/, `\norcid: ${orcid}\n---\n`));
  }
  prepare(contentDir);
  const run = spawnSync('node', ['tools/update-publications.js', ...args], {
    encoding: 'utf8',
    env: { ...process.env, SITE_CONTENT_DIR: contentDir, RECORDED_RESPONSES: 'tests/recorded' },
  });
  const publications = path.join(contentDir, 'publications');
  return {
    status: run.status,
    output: `${run.stdout}\n${run.stderr}`,
    file: (name) => fs.readFileSync(path.join(publications, name), 'utf8'),
    original: (name) => fs.readFileSync(path.join('tests/content/publications', name), 'utf8'),
    files: () => fs.readdirSync(publications).sort(),
  };
}

const ADD = 'npm run add-publication --';

test('the records read are those of current Members with an ORCID iD, never an Alumnus', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.output).toContain("Read the ORCID records of 2 Members: Dr. Zoë O'Neil & Co, Full Member.");
  expect(run.output).not.toContain('0000-0003-0000-0003');
  expect(run.output).not.toContain('Alumnus Example');
});

test('a work the Lab does not list is reported as new, with the command that adds it; no file is written for it', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.output).toContain('New: 3. Not on the site yet; each needs its Research Area from the Maintainer.');
  expect(run.output).toContain('- "Containing Tool-Using Agents: A Field Study" (published, 2025 Example Symposium on Agent Security (ESAS), 2025), in the record of Full Member.');
  expect(run.output).toContain(`${ADD} 10.5555/example.2025.containing --area <research-area>`);
  // Listed in ORCID by arXiv's own DOI, so read from arXiv.
  expect(run.output).toContain('- "Agents & Their Tools: What a Long Title Looks Like When arXiv Wraps It onto a Second Line" (preprint, arXiv, 2026), in the record of Full Member.');
  expect(run.output).toContain(`${ADD} https://arxiv.org/abs/2603.01234 --area <research-area>`);
  expect(run.files()).toEqual(['early-agents.md', 'enclave-attestation.md', 'prompt-injection-survey.md', 'sandbox-escapes.jpg',
    'sandbox-escapes.md', 'side-channels.md']);
});

test('one work is reported once: listed twice in a record, by two Members, or as a Preprint and its published version', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  // The Containing paper is in Full Member's record twice, once with no DOI.
  expect(run.output.split(`${ADD} `)).toHaveLength(4);
  // arXiv says its Preprint 2605.00006 was published with this DOI, which the record also lists.
  expect(run.output).toContain('- "Measuring How Agents Escape" (published, 2026 Example Conference on Agent Security, 2026), in the record of Full Member. Its Preprint: https://arxiv.org/abs/2605.00006');
  expect(run.output).toContain(`${ADD} 10.5555/example.2026.measuring --area <research-area>`);
  expect(run.output).not.toContain('Escaping Agents, Measured');
  // Both Members list the survey, one of them with its DOI in capitals.
  expect(run.output.match(/prompt-injection-survey\.md/g)).toHaveLength(1);
});

test('a Publication the record matches by title gains the DOI and arXiv link it lacked, and keeps all it had', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.output).toContain('Updated: 1.');
  expect(run.output).toContain('publications/enclave-attestation.md: added doi 10.5555/example.2023.enclave, arxiv https://arxiv.org/abs/2302.00004');
  expect(run.file('enclave-attestation.md')).toBe(`---
# Same year as side-channels.md: first by file name, second by title.
title: Zero-Trust Attestation for Enclaves
authors:
  - Dana Outside
  - member: test-director
venue: Example Hardware Conference
year: 2023
research_area: trusted-hardware
status: published
doi: 10.5555/example.2023.enclave
arxiv: https://arxiv.org/abs/2302.00004
---
`);
});

test('the DOI decides before the title: a work with one Publication\'s DOI and another\'s title is the first', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  // Its title is that of side-channels.md, its DOI that of sandbox-escapes.md.
  expect(run.file('side-channels.md')).toBe(run.original('side-channels.md'));
  expect(run.file('sandbox-escapes.md')).toBe(run.original('sandbox-escapes.md'));
  expect(run.output).not.toContain('side-channels.md');
  expect(run.output).toContain('Already on the site, unchanged: 1.');
});

test('a field the file already has is never changed: a DOI where the file has a paper link is left for review', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.file('early-agents.md')).toBe(run.original('early-agents.md'));
  expect(run.output).toMatch(/publications\/early-agents\.md has a paper link, and ORCID gives it the DOI 10\.5555\/example\.2022\.early/);
});

test('a work on the exclusion list is skipped before anything is asked about it, and reported with its reason', ({}, testInfo) => {
  // 10.5555/wrong.person has no recorded Crossref response: asking would stop the command.
  const run = updatePublications([], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.output).toMatch(/Excluded: 1, as \S*excluded-publications\.yaml lists\./);
  expect(run.output).toContain('- "Glazes of the Late Bronze Age" (10.5555/wrong.person): Written by another person of the same name.');
});

test('a Preprint whose published version has appeared is flagged for the Maintainer, its file unchanged', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.file('prompt-injection-survey.md')).toBe(run.original('prompt-injection-survey.md'));
  expect(run.output).toMatch(/publications\/prompt-injection-survey\.md is a Preprint, and its published version has appeared: Example Journal of Agent Security, 2026, DOI 10\.5555\/example\.2026\.survey\./);
});

test('a work whose authors do not include the Member who lists it is left for review, not reported as new', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.output).toContain('"Attesting Enclaves & Their Agents" (10.5555/2026.01.04.463034): the ORCID record of Full Member lists it, but Full Member is not among its authors.');
  expect(run.output).not.toContain(`${ADD} 10.5555/2026.01.04.463034`);
});

test('a work with no DOI or arXiv id is left for review', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.output).toContain('"A Workshop Paper Without Identifiers" (2024), in the record of Full Member, has no DOI or arXiv id');
});

test('an ORCID iD that ORCID does not hold is left for review, and the other records are still read', ({}, testInfo) => {
  const run = updatePublications([], testInfo);
  expect(run.output).toMatch(/ORCID has no record with the iD 0000-0000-0000-0000.*members\/bare-member\.md/);
  expect(run.output).toContain('New: 3.');
});

test('works the Lab does not list from before the year site.yaml sets, and works that are not papers, are skipped and counted', ({}, testInfo) => {
  const run = updatePublications([], testInfo, (dir) => {
    // A year after the oldest Publication's: the setting decides, not the Publications.
    const file = path.join(dir, 'site.yaml');
    fs.writeFileSync(file, `${fs.readFileSync(file, 'utf8')}publications_since: 2020\n`.replace('publications_since: 2022\n', ''));
  });
  expect(run.output).toContain('Skipped 1 work from before 2020, the year publications_since in site.yaml sets: pass --since <year> to read further back.');
  expect(run.output).toContain('Skipped 1 work that is not a paper (data-set).');
  expect(run.output).not.toContain('Before the Lab');
});

test('--since reads further back', ({}, testInfo) => {
  const run = updatePublications(['--since', '2019'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.output).toContain(`${ADD} 10.5555/example.2019.old --area <research-area>`);
  expect(run.output).not.toContain('Skipped 1 work from before');
});

test('an exclusion list entry without a reason stops the command, naming the file and the entry', ({}, testInfo) => {
  const run = updatePublications([], testInfo, (dir) => {
    fs.writeFileSync(path.join(dir, 'excluded-publications.yaml'), '- doi: 10.5555/wrong.person\n- title: Another\n  reason: Not ours.\n');
  });
  expect(run.status).toBe(1);
  expect(run.output).toMatch(/Cannot update the Publications: \S*excluded-publications\.yaml: entry 1 needs a "reason"/);
  expect(run.file('enclave-attestation.md')).toBe(run.original('enclave-attestation.md'));
});

test('a work excluded by the DOI the report gives it stays excluded, though its record lists only its arXiv Preprint', ({}, testInfo) => {
  // arXiv says 2605.00006 was published as 10.5555/example.2026.measuring.
  const run = updatePublications([], testInfo, (dir) => {
    fs.writeFileSync(path.join(dir, 'excluded-publications.yaml'), '- doi: 10.5555/example.2026.measuring\n  reason: Not the Lab\'s work.\n');
  });
  expect(run.status, run.output).toBe(0);
  expect(run.output).not.toContain(`${ADD} 10.5555/example.2026.measuring`);
  expect(run.output).toContain('- "Measuring How Agents Escape" (10.5555/example.2026.measuring): Not the Lab\'s work.');
});

test('a work the Lab lists is matched whatever its year: --since skips only works it does not list', ({}, testInfo) => {
  const run = updatePublications(['--since', '2023'], testInfo);
  expect(run.output).toMatch(/publications\/early-agents\.md has a paper link/);
});
