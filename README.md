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
| `npm run shots` | Saves screenshots of every page at 390, 768 and 1280 px to `.shots/`, for review. `npm run shots -- /about/` takes just the pages named. |

The slice tests never read `content/`. They build the site from the **test content set** in
`tests/content/`, so real content can change without breaking them. `tests/content-broken/` is
deliberately invalid: a test checks that the build refuses it.

The **site-wide checks** (`tests/site-wide/`) do the opposite: they build the site from the real
`content/` and visit every page in its sitemap at 390, 768 and 1280 px in Chromium, and at 390 px
in WebKit (Safari's engine). Every page must have no accessibility violations at WCAG 2.2 AA
(axe), no sideways scrolling, no request to any other site, no broken internal links, exactly one
main heading, a skip link that moves focus to the main content, and `lang="en"`. They assert
nothing about what a page says, so any content must pass them.

Pull requests also save the screenshots from `npm run shots` as a `screenshots` artifact on the
workflow run. Nothing compares them; they are for looking at.

## Working on this site with Claude Code

This site is built to be maintained with a coding agent. Everything the agent uses is committed
here, so a new Maintainer gets the whole workflow by cloning the repo:

- `CLAUDE.md`: the agent's instructions for this repo.
- `GLOSSARY.md`: the Lab's vocabulary (Member, Publication, Research Area, ...).
- `CODING_STANDARDS.md`: the rules a reviewer (person or agent) applies to every change.
- `docs/adr/`: why the big decisions were made.
- `docs/agents/`: how agents use the issue tracker, triage labels and domain docs.
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
