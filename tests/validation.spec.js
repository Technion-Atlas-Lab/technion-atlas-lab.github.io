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
