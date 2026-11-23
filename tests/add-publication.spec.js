// The add-publication command (tools/add-publication.js) turns a DOI, an
// arXiv link or a BibTeX entry into a Publication file. Each test runs it at
// its command line on a copy of the test content set, with Crossref and arXiv
// answered from the recorded responses in tests/recorded/, never the network.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// Runs the command on a fresh copy of the test content set. Gives back its
// exit `status`, what it printed (`output`), and `file(name)`: the text of a
// file in the copy's publications/ folder, or null when there is none.
function addPublication(args, testInfo) {
  const contentDir = path.join('.builds', 'add-publication', `${testInfo.testId}-${testInfo.retry}`);
  fs.rmSync(contentDir, { recursive: true, force: true });
  fs.cpSync('tests/content', contentDir, { recursive: true });
  const run = spawnSync('node', ['tools/add-publication.js', ...args], {
    encoding: 'utf8',
    env: { ...process.env, SITE_CONTENT_DIR: contentDir, RECORDED_RESPONSES: 'tests/recorded' },
  });
  const publications = path.join(contentDir, 'publications');
  return {
    status: run.status,
    output: `${run.stdout}\n${run.stderr}`,
    file: (name) => fs.existsSync(path.join(publications, name)) ? fs.readFileSync(path.join(publications, name), 'utf8') : null,
    files: () => fs.readdirSync(publications).sort(),
  };
}

// What publications/ of the test content set holds before the command runs.
const BEFORE = ['early-agents.md', 'enclave-attestation.md', 'prompt-injection-survey.md', 'sandbox-escapes.jpg',
  'sandbox-escapes.md', 'side-channels.md'];

test('a DOI becomes a Publication file, its authors matched to Members and Alumni', ({}, testInfo) => {
  const run = addPublication(['10.5555/example.2025.containing', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('containing-tool-using-agents.md')).toBe(`---
title: "Containing Tool-Using Agents: A Field Study"
authors:
  - member: full-member
  - Casey Collaborator
  - member: alumnus-example
  - member: test-director
venue: 2025 Example Symposium on Agent Security (ESAS)
year: 2025
research_area: agent-security
status: published
doi: 10.5555/example.2025.containing
---
`);
});

test('the report names the file and says how each author was written', ({}, testInfo) => {
  const run = addPublication(['10.5555/example.2025.containing', '--area', 'agent-security'], testInfo);
  expect(run.output).toContain('publications/containing-tool-using-agents.md (published, 2025 Example Symposium on Agent Security (ESAS), 2025)');
  expect(run.output).toContain('1. Full Member: Member (Full Member, members/full-member.md)');
  expect(run.output).toContain('2. Casey Collaborator: written as a name, not in members/.');
  expect(run.output).toContain('3. Alumnus Example: Alumnus (Alumnus Example, members/alumnus-example.md)');
  // The Member's name carries a title the paper leaves out.
  expect(run.output).toContain('4. Test Director: Member (Prof. Test Director, members/test-director.md)');
});

test('a DOI written as a doi.org link, in capital letters, finds the same work', ({}, testInfo) => {
  const run = addPublication(['https://doi.org/10.5555/EXAMPLE.2025.Containing', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('containing-tool-using-agents.md')).toContain('doi: 10.5555/example.2025.containing\n');
});

test('a DOI of a preprint server becomes a Preprint, a group of authors kept as one name', ({}, testInfo) => {
  const run = addPublication(['doi:10.5555/2026.01.04.463034', '--area', 'trusted-hardware'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('attesting-enclaves-their-agents.md')).toBe(`---
title: Attesting Enclaves & Their Agents
authors:
  - member: bare-member
  - The Example Consortium
venue: Example Preprint Server
year: 2026
research_area: trusted-hardware
status: preprint
doi: 10.5555/2026.01.04.463034
---
`);
});

test('an arXiv link becomes a Preprint that links to its arXiv page', ({}, testInfo) => {
  const run = addPublication(['https://arxiv.org/abs/2603.01234v2', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('agents-their-tools.md')).toBe(`---
title: "Agents & Their Tools: What a Long Title Looks Like When arXiv Wraps It onto a Second Line"
authors:
  - Dana Outsider
  - member: full-member
  - F. Member
venue: arXiv
year: 2026
research_area: agent-security
status: preprint
arxiv: https://arxiv.org/abs/2603.01234
---
`);
});

for (const source of ['arXiv:2603.01234', '2603.01234', 'https://arxiv.org/pdf/2603.01234', '10.48550/arXiv.2603.01234']) {
  test(`arXiv is asked for a paper given as ${source}`, ({}, testInfo) => {
    const run = addPublication([source, '--area', 'agent-security'], testInfo);
    expect(run.status, run.output).toBe(0);
    expect(run.file('agents-their-tools.md')).toContain('arxiv: https://arxiv.org/abs/2603.01234\n');
  });
}

test('an author who may be a Member under another spelling stays a name, and the report says to check', ({}, testInfo) => {
  const run = addPublication(['arXiv:2603.01234', '--area', 'agent-security'], testInfo);
  expect(run.output).toMatch(/3\. F\. Member: written as a name.*CHECK: may be Full Member, members\/full-member\.md/);
  expect(run.output).not.toMatch(/Dana Outsider.*CHECK/);
});

test('a file name can be chosen', ({}, testInfo) => {
  const run = addPublication(['arXiv:2603.01234', '--area', 'agent-security', '--name', 'agents-and-tools'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.files()).toEqual([...BEFORE, 'agents-and-tools.md'].sort());
});

// A refused run fails and leaves publications/ as it was; each test then
// checks that the output says why.
const outcome = (run) => ({ status: run.status, files: run.files() });
const REFUSED = { status: 1, files: BEFORE };

test('without a Research Area nothing is written, and the areas are listed for the Maintainer to choose', ({}, testInfo) => {
  const run = addPublication(['10.5555/example.2025.containing'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/needs its Research Area/);
  expect(run.output).toContain('agent-security  (AI Agent Security)');
  expect(run.output).toContain('trusted-hardware');
});

test('a Research Area the Lab does not have is refused, and the areas are listed', ({}, testInfo) => {
  const run = addPublication(['10.5555/example.2025.containing', '--area', 'no-such-area'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/no Research Area "no-such-area"/);
  expect(run.output).toContain('formal-methods');
});

test('a DOI the Lab already lists is refused, naming the Publication that has it', ({}, testInfo) => {
  // Not in the recorded responses: the command refuses before it asks Crossref.
  const run = addPublication(['10.5555/EXAMPLE.2024#001?a', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/publications\/sandbox-escapes\.md already has the DOI/);
});

test('a DOI Crossref does not hold is refused, saying so', ({}, testInfo) => {
  const run = addPublication(['10.5555/no-such-work', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/Crossref has no work with the DOI 10\.5555\/no-such-work/);
});

test('an arXiv id arXiv does not hold is refused, saying so', ({}, testInfo) => {
  const run = addPublication(['arXiv:9999.99999', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/arXiv has no paper with the id 9999\.99999/);
});

test('a file name that is taken is refused', ({}, testInfo) => {
  const run = addPublication(['arXiv:2603.01234', '--area', 'agent-security', '--name', 'side-channels'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/publications\/side-channels\.md already exists/);
});

test('something that is no DOI, arXiv link or BibTeX file is refused with the usage', ({}, testInfo) => {
  const run = addPublication(['https://dblp.org/rec/conf/example/Member25', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/is not a DOI, an arXiv link or a file with a BibTeX entry/);
  expect(run.output).toContain('Usage: npm run add-publication');
});

test('with recorded responses, an address that was not recorded stops the command: it never reaches the network', ({}, testInfo) => {
  const run = addPublication(['10.5555/never-recorded', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/no recorded response for https:\/\/api\.crossref\.org\/works\/10\.5555%2Fnever-recorded/);
});

test('the recorded responses are ORCID, Crossref and arXiv alone: no run asked DBLP or anyone else', () => {
  const hosts = Object.keys(JSON.parse(fs.readFileSync('tests/recorded/index.json', 'utf8'))).map((url) => new URL(url).host);
  expect([...new Set(hosts)].sort()).toEqual(['api.crossref.org', 'export.arxiv.org', 'pub.orcid.org']);
});

test('a BibTeX entry becomes a Publication file, its LaTeX read as plain text', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/one-entry.bib', '--area', 'formal-methods'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('verified-sandboxes-for-tool-using-agents.md')).toBe(`---
title: Verified Sandboxes for Tool-Using Agents
authors:
  - Zoë Müller
  - member: bare-member
  - Renée Collègue
  - member: ada-b
venue: Proceedings of the Example Conference on Formal Methods
year: 2023
research_area: formal-methods
status: published
doi: 10.5555/example.2023.verified
---
`);
});

test('a BibTeX entry for an arXiv paper becomes a Preprint, and the report says its author list was cut short', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/scholar-arxiv.bib', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('agents-their-tools.md')).toBe(`---
title: Agents & Their Tools
authors:
  - Dana Outsider
  - member: full-member
venue: arXiv
year: 2026
research_area: agent-security
status: preprint
arxiv: https://arxiv.org/abs/2603.01234
---
`);
  expect(run.output).toMatch(/CHECK: .*"and others"/);
});

test('a Publication whose title the Lab already lists is refused, naming the file that has it', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/already-listed.bib', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/publications\/sandbox-escapes\.md is already this Publication/);
});

test('a BibTeX file with two entries is refused: one Publication at a time', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/two-entries.bib', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/tests\/recorded\/two-entries\.bib holds 2 BibTeX entries/);
});

test('a BibTeX entry with no venue is refused, naming the file and what is missing', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/no-venue.bib', '--area', 'agent-security'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/tests\/recorded\/no-venue\.bib.*\bvenue\b/);
});

test('a BibTeX entry in double quotes keeps its accents, its dollar sign and its link', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/hard-entry.bib', '--area', 'formal-methods'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('saving-5-million.md')).toBe(`---
title: "Saving $5 Million: Detecting Violations"
authors:
  - Petr Šimon
  - Zoë Müller
venue: Example Journal of Formal Methods
year: 2022
research_area: formal-methods
status: published
paper: https://example.org/~member/paper--final.pdf
---
`);
  expect(run.output).not.toContain('CHECK');
});

test('a title with < and > is refused whole, never cut short', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/angle-brackets.bib', '--area', 'formal-methods'], testInfo);
  expect(outcome(run), run.output).toEqual(REFUSED);
  expect(run.output).toMatch(/field "title" must be plain text, not HTML/);
});

test('a BibTeX entry as DBLP writes one for an arXiv paper becomes a Preprint, not a copy of a Publication with a like DOI', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/dblp-arxiv.bib', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.file('a-paper-listed-under-corr.md')).toBe(`---
title: A Paper Listed Under CoRR
authors:
  - Dana Outsider
  - member: full-member
venue: arXiv
year: 2026
research_area: agent-security
status: preprint
doi: 10.5555/example-2024.001.a
arxiv: https://arxiv.org/abs/2603.01234
---
`);
});

test('a BibTeX abbreviation where a venue should be is reported to check', ({}, testInfo) => {
  const run = addPublication(['tests/recorded/abbreviation.bib', '--area', 'agent-security'], testInfo);
  expect(run.status, run.output).toBe(0);
  expect(run.output).toMatch(/CHECK: .*\bvenue\b.*"esas".*abbreviation/);
});
