// The build validates its content set and refuses broken content, naming the
// file and the field, so a mistake never reaches the live site.
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';

// One build in one worker serves every test below.
test.describe.configure({ mode: 'default' });

// A message naming `field` in the broken file, on one line.
const namesField = (field) => new RegExp(`tests/content-broken/site\\.yaml\\b.*\\b${field}\\b`);

let build;
test.beforeAll(() => {
  build = spawnSync('npm run build -- --output=.test-site-broken', {
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
