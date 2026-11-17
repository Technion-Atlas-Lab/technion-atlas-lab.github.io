# ATLAS Lab website

Source for the ATLAS Lab (Technion) website, published with GitHub Pages at
https://technion-atlas-lab.github.io

The site is built with [Eleventy 3](https://www.11ty.dev/) from the content in `content/`. Every
push to `main` validates the content, builds the site, runs the tests and publishes; if any step
fails, nothing is published. Every pull request runs the same checks without publishing.

## To change X, edit file Y

| To change | Edit |
|---|---|
| The Lab's name, full name, one-line mission or Lab mailbox | `content/site.yaml` |

Each content file's fields are described in `content/SCHEMA.md`. After editing, run
`npm run validate`.

## Commands

Install [Node.js](https://nodejs.org/) 22 or newer, then run `npm install` once.

| Command | What it does |
|---|---|
| `npm run serve` | Builds the site and serves it at http://localhost:8080, rebuilding on every change. |
| `npm run build` | Validates the content and builds the site into `_site/`. |
| `npm run validate` | Checks `content/` against `content/SCHEMA.md` without building. |
| `npm test` | Runs the slice tests in a real browser. Run `npx playwright install chromium` once first. |

The slice tests never read `content/`. They build the site from the **test content set** in
`tests/content/`, so real content can change without breaking them. `tests/content-broken/` is
deliberately invalid: a test checks that the build refuses it.

## Working on this site with Claude Code

This site is built to be maintained with a coding agent. Everything the agent uses is committed
here, so a new Maintainer gets the whole workflow by cloning the repo:

- `CLAUDE.md`: the agent's instructions for this repo.
- `GLOSSARY.md`: the Lab's vocabulary (Member, Publication, Research Area, ...).
- `docs/adr/`: why the big decisions were made.
- `docs/agents/`: how agents use the issue tracker, triage labels and domain docs.
- `docs/research/`: the research behind the site: Israeli accessibility and privacy law,
  Technion rules, the reference lab sites, and other labs' agent setups.
- `.claude/skills/`: the skills the agent uses here. The site's own skills are added as the site
  is built. `playwright-cli` comes from Playwright (installed by `npx playwright-cli install
  --skills`) and lets the agent open the site in a browser to see what a visitor sees.
- `.claude/settings.json`: enables the `mattpocock-skills` plugin. Claude Code offers to install
  it the first time you trust this folder.

The usual flow: an idea or issue → `/grill-with-docs` → `/to-spec` → `/to-tickets` → implement
each ticket test-first (`/tdd`) → pull request. Colleagues' bug reports and ideas arrive as issues
and go through `/triage`.
