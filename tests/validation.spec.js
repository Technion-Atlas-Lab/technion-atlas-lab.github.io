// The build validates its content set and refuses broken content, naming the
// file and the field, so a mistake never reaches the live site.
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';

// One build in one worker serves every test below.
test.describe.configure({ mode: 'default' });

// A message naming `field` in a file of the broken content set, on one line.
const namesFieldIn = (file) => (field) => new RegExp(`tests/content-broken/${file.replaceAll('.', '\\.')}\\b.*\\b${field}\\b`);
const namesField = namesFieldIn('site.yaml');
const namesMemberField = namesFieldIn('members/bad-member.md');
const namesAlumnusField = namesFieldIn('members/bad-alumnus.md');

let build;
test.beforeAll(() => {
  build = spawnSync('npm run build -- --output=.builds/test-broken', {
    shell: true,
    encoding: 'utf8',
    env: { ...process.env, SITE_CONTENT_DIR: 'tests/content-broken' },
  });
  build.output = `${build.stdout}\n${build.stderr}`;
});

test('the build fails on a broken content set', () => {
  expect(build.status, build.output).not.toBe(0);
});

test('the failure names the file and a missing required field', () => {
  expect(build.output).toMatch(namesField('mission'));
});

test('the failure names the file and an unknown field', () => {
  expect(build.output).toMatch(namesField('motto'));
});

test('the failure names an unknown field that shares its name with a built-in property', () => {
  expect(build.output).toMatch(namesField('constructor'));
});

test('the failure names a site address that is not an https address, and says why', () => {
  // Naming it as an unknown field would not do: the message must explain the rule.
  expect(build.output).toMatch(new RegExp(`${namesField('url').source}.*\\bhttps\\b`));
});

test('the failure names a Member file and its missing display order', () => {
  expect(build.output).toMatch(namesMemberField('order'));
});

test('the failure names a Member file and a role the Lab does not have, and lists the roles', () => {
  expect(build.output).toMatch(new RegExp(`${namesMemberField('role').source}.*\\bPhD Student\\b`));
});

test('the failure names a Member file and an unknown field', () => {
  expect(build.output).toMatch(namesMemberField('twitter'));
});

test('the failure names a Member file and an email that is not an address', () => {
  expect(build.output).toMatch(namesMemberField('email'));
});

test('the failure names a Member file and a field only an Alumnus has', () => {
  expect(build.output).toMatch(new RegExp(`${namesMemberField('year').source}.*\\bAlumnus\\b`));
});

test('the failure names an Alumnus file and its missing former role', () => {
  expect(build.output).toMatch(namesAlumnusField('former_role'));
});

test('the failure names an Alumnus file and a year that is not a year', () => {
  expect(build.output).toMatch(namesAlumnusField('year'));
});

test('the failure names a Member file and a photo that is not there', () => {
  expect(build.output).toMatch(new RegExp(`${namesMemberField('photo').source}.*no-such-photo\\.jpg`));
});

const namesAreaField = namesFieldIn('research-areas/bad-area.md');
const namesPublicationField = namesFieldIn('publications/bad-publication.md');
const namesAuthorsField = namesFieldIn('publications/bad-authors.md');

test('the failure names a Research Area file and its missing order', () => {
  expect(build.output).toMatch(namesAreaField('order'));
});

test('the failure names a Research Area file and an unknown field', () => {
  expect(build.output).toMatch(namesAreaField('colour'));
});

test('the failure names a Research Area file with no description', () => {
  expect(build.output).toMatch(namesAreaField('description'));
});

test('the failure names a Research Area file whose name is an anchor every page already uses', () => {
  expect(build.output).toMatch(/tests\/content-broken\/research-areas\/main\.md\b.*\bfile name\b/);
});

test('the failure names a Publication file and its missing venue', () => {
  expect(build.output).toMatch(namesPublicationField('venue'));
});

test('the failure names a Publication file and a Research Area that does not exist', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('research_area').source}.*\\bno-such-area\\b`));
});

test('the failure names a Publication file and an author who is not a Member or an Alumnus', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('authors').source}.*\\bno-such-member\\b`));
});

test('the failure names a Publication file and an author who is neither a name nor a reference', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('authors').source}.*\\bauthor 3\\b`));
});

test('the failure names a Publication file and a status that is not one, and lists the statuses', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('status').source}.*\\bpreprint\\b`));
});

test('the failure names a Publication file and a year that is not a year', () => {
  expect(build.output).toMatch(namesPublicationField('year'));
});

test('the failure names a Publication file and a DOI that is a web address', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('doi').source}.*\\b10\\.`));
});

test('the failure names a Publication file with both a DOI and a paper link', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('paper').source}.*\\bdoi\\b`));
});

test('the failure names a Publication file and a link that is not an https address', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('code').source}.*\\bhttps\\b`));
});

test('the failure names a Publication file and a figure with no alt text', () => {
  expect(build.output).toMatch(namesPublicationField('figure_alt'));
});

test('the failure names a Publication file and a featured flag that is not true or false', () => {
  expect(build.output).toMatch(new RegExp(`${namesPublicationField('featured').source}.*\\btrue\\b`));
});

test('the failure names a Publication file and an unknown field', () => {
  expect(build.output).toMatch(namesPublicationField('pages'));
});

test('the failure names a Publication file whose authors are not a list', () => {
  expect(build.output).toMatch(new RegExp(`${namesAuthorsField('authors').source}.*\\blist\\b`));
});

test('the failure names a Publication file and alt text for a figure that is not there', () => {
  expect(build.output).toMatch(new RegExp(`${namesAuthorsField('figure_alt').source}.*\\bfigure\\b`));
});

test('the failure names a file whose value holds a colon without quotes, and says to quote it', () => {
  // YAML's own message ("bad indentation of a mapping entry") does not say what to do.
  expect(build.output).toMatch(/tests\/content-broken\/publications\/bad-colon\.md\b.*\btitle\b.*\bquotes\b/);
});

const namesTalkField = namesFieldIn('news/bad-talk.md');
const namesNewsField = namesFieldIn('news/bad-news.md');

test('the failure names a News item file and its missing title', () => {
  expect(build.output).toMatch(namesTalkField('title'));
});

test('the failure names a News item file and a date not written as year-month-day, and shows the form', () => {
  expect(build.output).toMatch(new RegExp(`${namesTalkField('date').source}.*\\b2025-03-14\\b`));
});

test('the failure names a News item file and a date that is not a day of the calendar', () => {
  expect(build.output).toMatch(new RegExp(`${namesNewsField('date').source}.*\\b2025-02-30\\b`));
});

test('the failure names a News item file and a type that is not one, and lists the types', () => {
  expect(build.output).toMatch(new RegExp(`${namesNewsField('type').source}.*\\btalk\\b`));
});

test('the failure names a talk file with no recording link', () => {
  expect(build.output).toMatch(new RegExp(`${namesTalkField('recording').source}.*\\btalk\\b`));
});

test('the failure names a News item file and a recording link that is not an https address', () => {
  expect(build.output).toMatch(new RegExp(`${namesNewsField('recording').source}.*\\bhttps\\b`));
});

test('the failure names a News item file that has a recording link but is not a talk', () => {
  expect(build.output).toMatch(new RegExp(`${namesFieldIn('news/bad-recording.md')('recording').source}.*\\btalk\\b`));
});

test('the failure names a News item file and a related Member who is not a Member or an Alumnus', () => {
  expect(build.output).toMatch(new RegExp(`${namesTalkField('members').source}.*\\bno-such-member\\b`));
});

test('the failure names a News item file whose related Members are not a list', () => {
  expect(build.output).toMatch(new RegExp(`${namesNewsField('members').source}.*\\blist\\b`));
});

test('the failure names a News item file and an unknown field', () => {
  expect(build.output).toMatch(namesTalkField('location'));
});

test('the failure names a News item file with no body', () => {
  expect(build.output).toMatch(namesTalkField('body'));
});

test('the failure names a News item file that names a related Member twice', () => {
  expect(build.output).toMatch(new RegExp(`${namesFieldIn('news/bad-members.md')('members').source}.*\\bbad-member\\b.*\\bmore than once\\b`));
});
