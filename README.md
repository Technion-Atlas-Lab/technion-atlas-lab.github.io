# ATLAS Lab website

Source for the ATLAS Lab (Technion) website, published with GitHub Pages at
https://technion-atlas-lab.github.io

The site is built with [Eleventy 3](https://www.11ty.dev/) from the content in `content/`.
Changes reach `main` only through a pull request whose checks pass: validation, the lint, the
build, the link check, the slice tests and the site-wide checks. No reviewer is required. Every push to `main` runs
the same checks and publishes; if any check fails, nothing is published.

## To change X, edit file Y

| To change | Edit |
|---|---|
| The Lab's name, full name, mission or Lab mailbox, or the site's address (at Go-live) | `content/site.yaml` |
| The Lab mailbox or the site's address, as GitHub's "New issue" page shows them | The files in `.github/ISSUE_TEMPLATE/`, which repeat them because GitHub cannot read `content/site.yaml`: the Lab mailbox is in all three, the site's address in `config.yml` and `report-a-problem.yml` |
| What the feedback forms ask | `.github/ISSUE_TEMPLATE/report-a-problem.yml`, `.github/ISSUE_TEMPLATE/suggest-an-idea.yml` |
| A Member's name, role, place in their group, bio, contact details or links | That Member's file in `content/members/` (add a Member: add a file; remove one: delete it, unless a Publication names them as an author or a News item relates to them, in which case make them an Alumnus) |
| A Member's photo | Put the photo in `content/members/` and name it in the Member's `photo` field. The build resizes it and removes its metadata. |
| The Alumni (former role, year, current position) | The Alumnus's file in `content/members/`, with `role: Alumnus` |
| A Research Area's title, description or place on the Research page | That area's file in `content/research-areas/` (add an area: add a file) |
| A Publication's title, authors, venue, year, Research Area, Preprint status, links, figure or summary | That Publication's file in `content/publications/` (add a Publication: add a file; its figure goes beside it) |
| A News item's title, date, type (news or talk), body, related Members or, for a talk, recording link | That item's file in `content/news/` (add a News item: add a file) |
| The accessibility statement: its text, the date of the last check with the browsers and screen reader used, the Technion accessibility coordinator's details | `src/pages/accessibility.njk`, with its "last updated" date at the bottom; `tests/accessibility.spec.js` expects the same details and date |
| The Privacy page: its text, the Technion data protection officer's address | `src/pages/privacy.njk`, with its "last updated" date at the bottom; `tests/privacy.spec.js` expects the same address and date |
| The colours, fonts and layout | `src/assets/site.css` (every colour is in `:root` at the top) |
| The logo | `src/assets/logo.avif` |
| The menu | `src/_data/menu.js` (each `url` must match its page's `permalink` in `src/pages/`) |
| The header or the footer | `src/_includes/partials/header.njk`, `src/_includes/partials/footer.njk` |

Each content file's fields are described in `content/SCHEMA.md`. After editing, run
`npm run validate`.

## Commands

Install [Node.js](https://nodejs.org/) 22.12 or newer, then run `npm install` once.

| Command | What it does |
|---|---|
| `npm run serve` | Builds the site and serves it at http://localhost:8080, rebuilding on every change. |
| `npm run build` | Validates the content and builds the site into `_site/`. |
| `npm run validate` | Checks `content/` against `content/SCHEMA.md` without building. |
| `npm run lint` | Checks the code for bugs (ESLint), such as an unused variable or a test assertion missing its `await`. Formatting is not checked. |
| `npm run linkcheck` | Checks that every internal link and file reference in `_site/` leads somewhere. Run `npm run build` first. |
| `npm test` | Runs the slice tests in a real browser. Run `npx playwright install chromium` once first. |
| `npm run test:site` | Runs the site-wide checks on every page of the real site. Run `npx playwright install chromium webkit` once first. |
| `npx playwright-cli install-browser chrome-for-testing` | One-time install of the browser the agent's Playwright CLI opens (its own build, separate from the tests' browsers). `.playwright/cli.config.json` tells the CLI to use it. |
| `npm run check` | Runs all six checks above in order (validate, lint, build, link check, slice tests, site-wide checks) and stops at the first that fails. Run it before opening a pull request. |
| `npm run shots` | Saves screenshots of every page at 390, 768 and 1280 px to `.shots/`, for review. `npm run shots -- /about/` takes just the pages named. |

The slice tests never read `content/`. They build the site from the **test content set** in
`tests/content/`, so real content can change without breaking them. `tests/content-broken/` is
deliberately invalid: a test checks that the build refuses it.

The **site-wide checks** (`tests/site-wide/`) do the opposite: they build the site from the real
`content/` and visit every page in its sitemap, and the page-not-found page, at 320, 390, 768 and 1280 px in Chromium, and at 390 px
in WebKit (Safari's engine). Every page must have no accessibility violations at WCAG 2.2 AA
(axe), no sideways scrolling, no request to any other site, no broken internal links, exactly one
main heading, a skip link that moves focus to the main content, no link to the Lab's issue
tracker, no cookie and nothing stored in the browser, the Accessibility and Privacy links in its
footer, no motion when the system asks for reduced motion, and `lang="en"`. They assert
nothing about what a page says, so any content must pass them.

Pull requests also save the screenshots from `npm run shots` as a `screenshots` artifact on the
workflow run. Nothing compares them; they are for looking at.

## Feedback from the Lab

Colleagues report problems and suggest ideas on GitHub's "New issue" page:

https://github.com/Technion-Atlas-Lab/technion-atlas-lab.github.io/issues/new/choose

Share this link with the Lab directly, by email or chat. The public site never links to it (a
site-wide check enforces this), so that issues come from the Lab only.

The page offers two forms, "Report a problem" and "Suggest an idea". Each new issue is labelled
`needs-triage`, plus `bug` or `enhancement`. A blank issue cannot be opened. A colleague without
a GitHub account writes to the Lab mailbox instead.

A request to change or remove someone's personal information never belongs in an issue, because
issues are public. The page's third entry, "Change or remove your personal information", sends
such a request to the Lab mailbox. It opens the Privacy page instead of an email, because GitHub
hides a contact link whose address is `mailto:`.

## Working on this site with Claude Code

This site is built to be maintained with a coding agent. Everything the agent uses is committed
here, so a new Maintainer gets the whole workflow by cloning the repo:

- `CLAUDE.md`: the agent's instructions for this repo.
- `GLOSSARY.md`: the Lab's vocabulary (Member, Publication, Research Area, ...).
- `CODING_STANDARDS.md`: the rules a reviewer (person or agent) applies to every change.
- `docs/adr/`: why the big decisions were made.
- `docs/agents/`: how agents use the issue tracker, triage labels and domain docs, and the
  places a new content type touches.
- `docs/research/`: the research behind the site: Israeli accessibility and privacy law,
  Technion rules, the reference lab sites, and other labs' agent setups.
- `.claude/skills/`: the skills the agent uses here. The site's own skills are added as the site
  is built. `playwright-cli` comes from Playwright (installed by `npx playwright-cli install
  --skills`) and lets the agent open the site in a browser to see what a visitor sees.
  `exploratory-qa` sends two agents, a happy-path visitor and an adversarial visitor, through
  the locally served site after each ticket that changes templates, styles or behaviour.
- `.claude/settings.json`: enables the `mattpocock-skills` plugin. Claude Code offers to install
  it the first time you trust this folder.

The usual flow: an idea or issue → `/grill-with-docs` → `/to-spec` → `/to-tickets` → implement
each ticket test-first (`/tdd`) → exploratory QA (`/exploratory-qa`) → pull request. Colleagues'
bug reports and ideas arrive as issues and go through `/triage`.
