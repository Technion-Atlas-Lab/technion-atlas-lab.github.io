// The Projects page: the Offered Student Projects, then the Completed ones,
// and how to take one. Built from the Student Projects in the test content
// set (tests/content/student-projects/).
import { test, expect } from '@playwright/test';

// The part of the page under a heading.
const section = (page, name) => page.getByRole('region', { name, exact: true });
// A Student Project, found by its title.
const project = (page, title) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('Projects lists the Offered Student Projects before the Completed ones', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('main').getByRole('heading', { level: 2 }))
    .toHaveText(['How to take a project', 'Offered Student Projects', 'Completed Student Projects']);
  // By title; by file name the other would come first.
  await expect(section(page, 'Offered Student Projects').getByRole('heading', { level: 3 }))
    .toHaveText(['Benchmarking Enclave Attestation', 'Fuzzing Tool-Using Agents']);
  await expect(section(page, 'Completed Student Projects').getByRole('heading', { level: 3 })).toHaveText([
    'Agent Audit Logs & Their Limits', // 2024; by file name it would come after the kit
    'Prompt Injection Red-Team Kit', // 2024
    'A Sandbox Visualiser', // 2023, though first by title
  ]);
});

test('a Student Project shows its description, its Research Area and its supervisors in the order given', async ({ page }) => {
  await page.goto('/projects/');
  const fuzzing = project(page, 'Fuzzing Tool-Using Agents');
  await expect(fuzzing.getByRole('paragraph'))
    .toHaveText(['Build a fuzzer that feeds a tool-using agent malformed tool results.', 'Suits a student who has taken a course in computer security.']);
  await expect(fuzzing.getByRole('term')).toHaveText(['Research Area', 'Supervisors']);
  await expect(fuzzing.getByRole('definition')).toHaveText(['AI Agent Security', "Dr. Zoë O'Neil & Co, Prof. Test Director"]);
  // One supervisor is not "Supervisors".
  await expect(project(page, 'Benchmarking Enclave Attestation').getByRole('term')).toHaveText(['Research Area', 'Supervisor']);
});

test('a supervisor who is a Member links to their Profile; an Alumnus is named without a link', async ({ page }) => {
  await page.goto('/projects/');
  const supervisors = project(page, 'Prompt Injection Red-Team Kit').getByRole('definition').filter({ hasText: 'Alumnus Example' });
  await expect(supervisors).toHaveText("Dr. Zoë O'Neil & Co, Alumnus Example");
  await expect(supervisors.getByRole('link')).toHaveText(["Dr. Zoë O'Neil & Co"]);
  await supervisors.getByRole('link').click();
  await expect(page).toHaveURL('/people/zoe-oneil/');
});

test('a Student Project leads to its Research Area on Research', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/projects/');
  await project(page, 'Benchmarking Enclave Attestation').getByRole('link', { name: 'Trusted Hardware' }).click();
  await expect(page).toHaveURL('/research/#trusted-hardware');
  await expect(page.getByRole('heading', { name: 'Trusted Hardware', level: 2 })).toBeInViewport();
});

test('a Completed Student Project shows its year, and an Offered one shows none', async ({ page }) => {
  await page.goto('/projects/');
  await expect(project(page, 'Prompt Injection Red-Team Kit').getByText('Completed in 2024', { exact: true })).toBeVisible();
  await expect(project(page, 'A Sandbox Visualiser').getByText('Completed in 2023', { exact: true })).toBeVisible();
  await expect(project(page, 'Fuzzing Tool-Using Agents')).toBeVisible();
  await expect(project(page, 'Fuzzing Tool-Using Agents').getByText(/Completed|20\d\d/)).toHaveCount(0);
});

test('a Student Project names its students as written, and one without student names has no label for them', async ({ page }) => {
  await page.goto('/projects/');
  const kit = project(page, 'Prompt Injection Red-Team Kit');
  await expect(kit.getByRole('term')).toHaveText(['Research Area', 'Supervisors', 'Students']);
  await expect(kit.getByRole('definition').last()).toHaveText("Sam Student, Dana O'Brien & Partner");
  const logs = project(page, 'Agent Audit Logs & Their Limits');
  await expect(logs.getByRole('term')).toHaveText(['Research Area', 'Supervisor']);
  await expect(logs.getByText('Student', { exact: false })).toHaveCount(0);
});

test('a Student Project links to the report, code and video it has, each named for its project', async ({ page }) => {
  await page.goto('/projects/');
  const links = project(page, 'Prompt Injection Red-Team Kit').getByRole('list').getByRole('link');
  // The project's title is in each link's name, so a screen reader's list of links tells one "Code" from another.
  await expect(links).toHaveText(['Report', 'Code', 'Video']);
  for (const [i, label] of ['Report', 'Code', 'Video'].entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(`${label}: Prompt Injection Red-Team Kit`);
  }
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    'https://example.org/reports/red-team-kit.pdf',
    'https://example.org/code/red-team-kit',
    'https://example.org/video/red-team-kit',
  ]);
});

test('a Student Project shows only the links it has', async ({ page }) => {
  await page.goto('/projects/');
  const code = project(page, 'Agent Audit Logs & Their Limits').getByRole('list').getByRole('link');
  await expect(code).toHaveAccessibleName('Code: Agent Audit Logs & Their Limits');
  await expect(code).toHaveAttribute('href', 'https://example.org/code/audit-logs');
  // No link at all: no empty list is left behind.
  const bare = project(page, 'A Sandbox Visualiser');
  await expect(bare).toBeVisible();
  await expect(bare.getByRole('list')).toHaveCount(0);
});

test('a title reaches its Student Project as written, ampersand included', async ({ page }) => {
  await page.goto('/projects/');
  await expect(project(page, 'Agent Audit Logs & Their Limits').getByRole('heading')).toHaveText('Agent Audit Logs & Their Limits');
});

test('the "How to take a project" box comes first and links to the course page from the site settings', async ({ page }) => {
  await page.goto('/projects/');
  const box = section(page, 'How to take a project');
  await expect(box.getByRole('link')).toHaveText(['Student Project course page']);
  await expect(box.getByRole('link')).toHaveAttribute('href', 'https://example.org/courses/project-course');
  await expect(box.getByRole('article')).toHaveCount(0);
});

test('the Offered Student Projects have a stable address that leads to them', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto('/projects/#offered');
  await expect(page.getByRole('heading', { name: 'Offered Student Projects', level: 2 })).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'How to take a project', level: 2 })).not.toBeInViewport();
});

test('Projects has no search or filter controls', async ({ page }) => {
  await page.goto('/projects/');
  const main = page.getByRole('main');
  await expect(main.getByRole('article')).toHaveCount(5);
  for (const role of ['button', 'textbox', 'searchbox', 'combobox', 'checkbox', 'radio']) {
    await expect(main.getByRole(role)).toHaveCount(0);
  }
});

for (const width of [320, 390]) {
  test(`at ${width} px Projects does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/projects/');
    await expect(page.getByRole('article')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
