// The feedback forms a colleague meets on GitHub's "New issue" page
// (.github/ISSUE_TEMPLATE/): what each form asks, which labels a new report
// gets, and where the chooser sends personal-information requests. GitHub
// only shows these files once they are on main, so this is the one place they
// are checked before that.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { test, expect } from '@playwright/test';
import { ROOT } from '../lib/content.js';

const read = (file) => yaml.load(fs.readFileSync(path.join(ROOT, '.github/ISSUE_TEMPLATE', file), 'utf8'));

// The questions a form asks, in order: each one's label and whether GitHub
// refuses the report without an answer. Notes that ask nothing are left out.
const questions = (form) => form.body
  .filter((item) => item.type !== 'markdown')
  .map((item) => ({ label: item.attributes.label, required: item.validations?.required === true }));

test.describe('"Report a problem"', () => {
  let form;
  test.beforeAll(() => { form = read('report-a-problem.yml'); });

  test('is offered under that name, with a line saying what it is for', () => {
    expect(form.name).toBe('Report a problem');
    expect(form.description).toBeTruthy();
  });

  test('asks for the page link and what is wrong, then the device and browser and a screenshot', () => {
    expect(questions(form)).toEqual([
      { label: 'Page link', required: true },
      { label: "What's wrong?", required: true },
      { label: 'Device and browser', required: false },
      { label: 'Screenshot', required: false },
    ]);
  });

  test('labels the report as a bug that needs triage', () => {
    expect(form.labels).toEqual(['bug', 'needs-triage']);
  });
});

test.describe('"Suggest an idea"', () => {
  let form;
  test.beforeAll(() => { form = read('suggest-an-idea.yml'); });

  test('is offered under that name, with a line saying what it is for', () => {
    expect(form.name).toBe('Suggest an idea');
    expect(form.description).toBeTruthy();
  });

  test('asks what the idea is, then why', () => {
    expect(questions(form)).toEqual([
      { label: 'What is your idea?', required: true },
      { label: 'Why would it help?', required: false },
    ]);
  });

  test('labels the idea as an enhancement that needs triage', () => {
    expect(form.labels).toEqual(['enhancement', 'needs-triage']);
  });
});

test.describe('the chooser', () => {
  let chooser;
  test.beforeAll(() => { chooser = read('config.yml'); });

  test('offers no blank issue, so every report comes through a form', () => {
    expect(chooser.blank_issues_enabled).toBe(false);
  });

  test('steers personal-information requests to the Lab mailbox', () => {
    expect(chooser.contact_links).toHaveLength(1);
    const [link] = chooser.contact_links;
    expect(link.name).toBe('Change or remove your personal information');
    expect(link.about).toContain('atlaslab.at.technion@gmail.com');
  });

  test('links to a web page, because GitHub drops a contact link that is not one', () => {
    // A mailto: address makes GitHub leave the link out of the chooser without
    // saying so, and the request would then have nowhere to go but a public issue.
    expect(chooser.contact_links[0].url).toMatch(/^https:\/\//);
  });
});
