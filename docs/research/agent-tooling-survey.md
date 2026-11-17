# Agent tooling and publication automation survey (other lab websites)

Collected 2026-11-17. Each repo was cloned with `git clone --depth 1` into a fresh temp directory and read only. Nothing was installed, built or run. Line counts and quotes come from the default branch at the date shown. TechnionTDK and adesnik-lab are covered in `tdk-inventory.md` and `adesnik-inventory.md`, so they are not repeated here.

## Overview

| Repo | Stack | License (GitHub / file) | Agent files | Publication automation | Visual / a11y checks |
| --- | --- | --- | --- | --- | --- |
| tud-amr/website (TU Delft), last commit 2026-11-13 | Eleventy 3.1.2, Liquid, plain CSS, Docker option | none / no LICENSE file | `CLAUDE.md` (8 KB) | `npm run add-pub -- x.bib` (BibTeX to YAML, manual) | Playwright + axe in CI on every PR; `npm run shots` (390/768/1280, dark mode); layout overflow + page-weight tests; weekly lychee issue |
| patchlab-upenn/patchlab-upenn.github.io (Penn), 2026-11-13 | Jekyll, al-folio theme | MIT (al-folio's, "Copyright (c) 2022 Maruan Al-Shedivat") | `CLAUDE.md` (2.7 KB), `.claude/skills/update-bibliography/SKILL.md` | Semantic Scholar fetch + merge, run by the agent on request | al-folio's axe workflow (manual only), lychee on push/PR and after deploy; screenshots by instruction only |
| suvitca/barnard-ladr (Barnard), 2026-11-06 | Eleventy 3.1.6, Nunjucks, YAML data | none / none | `CLAUDE.md` (1 KB) | none (hand-edited YAML) | none (deploy only) |
| harvardSys/harvardsys.github.io (Harvard), 2026-11-16 | Hugo 0.164.0, theme submodule `HarvardSys/hugo-paper` (MIT) | none / none | `CLAUDE.md` (6.7 KB) + `docs/*.md` | none | none in CI; per-branch Cloudflare preview with PR comment |
| serre-lab/Lab-Website (Brown), 2026-11-11 | React 18 + Vite + Mantine SPA, hash routing | none / none | `CLAUDE.md` (7.9 KB), `AGENTS.md` (pointer), `.cursorrules` (pointer) | Sync from PI's private CV repo (machine-local paths) | Playwright + axe (WCAG 2.1 AA tags), reflow/text-spacing tests, keyboard tests (local only); Lighthouse CI on live site after deploy |
| jameststroud/jameststroud.github.io (Georgia Tech), 2026-11-16 | Eleventy 3, Nunjucks, YAML | none / none | none (but agent-style audit docs: `SEO_AUDIT.md`, `VERIFICATION.md`, `INDEXING_PLAN.md`, `mobile-audit/REPORT.md`) | Weekly ORCID + Crossref Action that opens a PR; abstracts from Crossref/OpenAlex/PubMed | One-off Playwright mobile audit (screenshots committed, script not); Lighthouse 12 (manual) |
| humanbuildingsynergy/humanbuildingsynergy.github.io (Arizona), 2026-11-13 | Eleventy 3, Nunjucks, YAML | NOASSERTION / custom dual: MIT for code, CC BY-NC 4.0 for content | `CLAUDE.md` exists locally but is git-ignored | ORCID + Crossref + arXiv fetched at build time; weekly scheduled rebuild; overrides file; committed cache | No a11y/screenshot tests; weekly lychee issue; weekly "draft news" PR |

---

## 1. tud-amr/website (TU Delft, Autonomous Multi-Robots Lab)

**License:** none. GitHub reports no license and there is no LICENSE file. Only the font licenses are in `src/fonts/`. Reusing code needs permission, though reading it for ideas is fine.

**Agent files:** `CLAUDE.md` only. There is no `.claude/` and no `AGENTS.md`. `.vscode/settings.json` exists.

### CLAUDE.md structure

The file opens: "Instructions for AI agents editing the AMR Lab website ... Humans: see README.md." It has these sections:

1. **What this is**: "most requests are content edits, not code changes."
2. **Commands**: a table with a Node form and a Docker form for each task ("Node may not be installed; everything also runs in Docker. Prefer the Docker form if `node` is missing."). The tasks are validate, build, `npm test` (all checks, same as CI), dev, shots, and add-pub.
3. **Before you finish any change**: a four-step checklist:
   > 1. Run `npm run validate` after every content edit; fix every error it prints (they name the file and field).
   > 2. Run the full checks (`npm test` or `docker compose run --rm test`). Do not commit with failures.
   > 3. For anything visible, take screenshots of the affected pages (`npm run shots -- <paths>`) and look at them at 390 px and 1280 px. Check nothing overflows sideways on the phone width.
   > 4. Tell the user which files you changed and what the checks said.
4. **Rules**. These are the most useful:
   - "**Never break an existing URL.** ... If a page must move, add `redirect_from` ... for a removed page, add an entry to `content/_data/redirects.yaml`. `npm run check:urls` compares against `tests/baseline/files.txt`."
   - "**Publications keep every field**, in the order of `content/publications/_template.yaml`, with empty values as `[]` or `""` (never `null`, never omitted). Lab members copy existing files as templates."
   - "**IDs must exist**": project, collection and area IDs must refer to existing content.
   - "**Do not lose metadata.** When cleaning up data, keep values (move them to the right field, or keep a YAML comment saying what was there before)."
   - Media size limits ("images under ~2 MB, videos ideally under 5 MB ... say so if a user adds large files").
   - "Do not edit generated or recorded files: `_site/`, `.cache/`, `tests/baseline/*`".
   - Colours: "use the CSS variables ... never hard-coded colours, so the dark theme keeps working. Look at visible changes in both themes (`npm run shots -- <paths> --dark`)."
5. **Recipes**: add a publication ("most common request"), add a person, someone left ("add `left_date` ... do not delete the file"), project, news, paper website, collection, and page.
6. **Where things are**: a path map. It closes with "Adding a new front-matter field to a content type means adding it to the schema in `src/lib/content.mjs`, otherwise validation may reject it."

### `npm run validate` (`scripts/validate.mjs` + `src/lib/content.mjs`, 320 lines)

- Every content type has a schema. The header comment says: "checks required fields, allowed values, IDs that point at other content, and local /assets/ files, and returns readable errors ("content/people/x.md: `joined_date` is required"). The build fails on any error".
- Field validators return plain-English errors, for example "must be a date like 2026-01-31" (rejects 2024-02-30) or "must be a list, e.g. [] or [a, b]". Publications reject unknown fields.
- It rejects leftover syntax from the old Jekyll site and says what to write instead.
- There is no duplicate-paper check (no DOI or title dedupe).

### `npm run add-pub` (`scripts/add-pub.mjs`, 111 lines)

- **Inputs:** a `.bib` file with one entry, plus optional repeatable `--project`, `--collection` and `--pdf`. CLAUDE.md explains how to get BibTeX: `curl -LH "Accept: application/x-bibtex" https://doi.org/<doi>`, or `https://arxiv.org/bibtex/<id>` for arXiv papers.
- **Steps:** a small hand-written BibTeX parser maps entry types. `article` becomes journal and `inproceedings` becomes conference. A venue matching /workshop/ becomes workshop. `misc` with an arXiv eprint and no journal or booktitle becomes `preprint`. The script builds links from the DOI, URL or arXiv eprint. It names the file `content/publications/<year>/<year>-<surname>-<venue acronym>.yaml`, writes every template field in order, and stores the raw BibTeX for a "cite" button.
- **Safeguards:** it refuses if the file already exists ("Rename it or edit it instead."). An unknown type gets an inline `# check:` comment. It ends with "Check it, add the PDF and any links, then run: npm run validate". It does no network fetching and no dedupe against existing papers.

### Screenshots: `npm run shots` (`scripts/shots.mjs`, 59 lines)

- Uses Playwright Chromium against the built `_site/` through a local server that mimics GitHub Pages (`scripts/lib/serve.mjs`).
- Options: `/path/` arguments, `--key` (13 representative pages), `--all` (every sitemap URL), `--widths=390`, and `--dark`. The default widths are 390, 768 and 1280.
- It scrolls through each page so lazy images load, then saves a full-page PNG to `.shots/<page>@<width>.png`. It prints `(scrolls sideways!)` when `scrollWidth > clientWidth + 1`.
- The header says: "for checking changes by eye (or by an agent)".

### Tests and CI

- `npm test` runs `validate && build && check:urls && check:links && test:e2e`.
- `tests/e2e/a11y.spec.js` runs `@axe-core/playwright` on the template pages in **both light and dark themes** and fails only on `serious`/`critical` violations. Authors' own HTML (paper websites, workshops) is excluded.
- `layout.spec.js`: "No page may scroll sideways on a phone or tablet". It checks every sitemap page at 390 and 768 px and reports the offending elements.
- `weight.spec.js`: per-page MB budgets at 390 and 1280 px, measured with CDP ("Raise a budget only with a reason in the commit").
- There are also navigation, publications and research specs.
- `check:urls` compares the build against every file the old site published, with an `EXCEPTIONS` map where each entry has a reason. `check:links` checks every internal href and src, with a `KNOWN_BROKEN` map ("Keep this list short").
- `compare-text` is a content-parity aid against the old site (97% word threshold, "not pass/fail"). `site-size` reports the published size.
- `.github/workflows/ci.yml` runs on `pull_request` in the `mcr.microsoft.com/playwright:v1.48.0-noble` container. It runs `npm test`, then `npm run shots -- --key || true`, then `site-size`, and uploads `playwright-report/`, `test-results/` and `.shots/` as one artifact (14-day retention).
- `.github/workflows/links.yml` runs weekly (Monday 06:00 UTC). It runs lychee on external links (`--accept 200..=299,403,429`, excludes LinkedIn, `fail: false`) and opens or updates **one** issue titled "Broken external links" with `peter-evans/create-issue-from-file`. The comment explains: "These break on their own, so they do not block pull requests".
- Visitor statistics come from GoatCounter (`fetch-stats.mjs`, token stored as a secret).

**Worth porting:** almost all of it. It uses the same generator (Eleventy 3). The most valuable parts are the CLAUDE.md "Before you finish" checklist, the schema validator with file-and-field errors, `shots.mjs` (phone and desktop screenshots an agent can look at), and the PR CI that uploads screenshots as an artifact.

---

## 2. patchlab-upenn/patchlab-upenn.github.io (Penn, PATCH Lab)

**License:** MIT. This is the al-folio theme's LICENSE, "Copyright (c) 2022 Maruan Al-Shedivat".

**Agent files:** `CLAUDE.md` and `.claude/skills/update-bibliography/SKILL.md`. There is no other file under `.claude/` (no settings.json, no commands) and no `AGENTS.md`.

### CLAUDE.md (two sections)

- **Workflow:** lab members work in a fork. Before starting, the agent syncs with `git merge --ff-only upstream/main` and creates a branch: "Never commit to `main`." It warns that `upstream` may point at `alshedivat/al-folio` ("don't sync from that unless asked to update the theme"). When done, it runs Prettier, pushes and runs `gh pr create --repo patchlab-upenn/patchlab-upenn.github.io`. "There are no preview links; the user previews locally." It also says: "To check a page visually, take a headless Chrome screenshot and look at it."
- **Content conventions:**
  - "Photos: crop around the face and re-save without EXIF metadata, which can include GPS location."
  - "Verify IDs before using them (ORCID via the ORCID API, etc.). IDs copied from other web pages have been wrong before."
  - Research projects: "Write only from the papers' abstracts; don't add claims they don't support."
  - "Figures from papers: reuse only when the license allows it (check Crossref or Europe PMC), and credit the figure and license in the caption."
  - Publications: use the skill; "never replace the file wholesale with a fresh fetch."

### Skill `update-bibliography`

- **Frontmatter:** the description ends "Use when asked to update, refresh, sync, or pull in new/recent publications for the site."
- **Purpose:** "Refreshes `_bibliography/papers.bib` with newly published papers, without silently losing entries already on the site. Semantic Scholar's per-author paper listing is not perfectly stable between runs ... so the fresh fetch is merged into the existing file rather than copied over it."
- **Inputs:**
  - the `AUTHORS` list in `tools/bibliography/fetch_scholar.py`: three Semantic Scholar author IDs. The skill says to "verify the ID by checking the author's papers before adding it".
  - `excluded_dois.txt`
  - the existing `papers.bib`
  - `merged_papers.bib` and `scholar_cache.json`, which are git-ignored scratch files.
- **Steps:**
  1. Branch and set up a venv.
  2. Back up `papers.bib` to `/tmp`.
  3. "Run the fetch for real, not a `--limit` test" (about 1 request per second).
  4. Merge into `/tmp/papers_merged.bib` and read the counts: "If `kept_from_old_only` is large, the fetch may have been rate limited or truncated".
  5. Validate with the BibTeX library that jekyll-scholar uses (`bundle exec ruby -e 'require "bibtex"; ...'`).
  6. Copy into place and run `jekyll build`.
  7. Spot-check `/publications/` locally, checking that the port is free first.
  8. Report `git diff --stat` and the added, kept and updated counts, then open the PR.
- **Safeguards:**
  - backup, merge instead of replace, the count check, and a parse check
  - the exclusion list (16 CMS particle-physics DOIs: "it has merged a CMS physicist named Das Chagas into Sandy Das's profile")
  - a warning for entries without a lab surname, with these instructions: "Show those to the user, and with their agreement add the DOIs of misattributed papers to the exclusion file and merge again."
  - The surname match requires the name to end with the surname, so "Das Chagas" does not count.
  - Key collisions are renamed `<key>dup2`.
  - A "Known quirks" section (escaping, missing years, future dates). It ends: "Don't put an author's Scholar profile ID there; it produces broken badges."
- **Merge logic (`merge_bibliography.py`):** the docstring says entries are "matched by DOI (preferred) or normalized title". The code actually uses the normalized title as the fingerprint whenever a title exists and falls back to the DOI otherwise (`fp = f"title:{title}" if title else f"doi:{doi}"`). On a match the fresh record wins. Old-only entries are kept. The output is sorted by year, month and first-author surname.
- **Fetch (`fetch_scholar.py`, 315 lines):** Semantic Scholar Graph API with no key, `DELAY = 1.1` s, and retry on 429. It adds `doi`, `altmetric = {true}` and `dimensions = {true}`.
- **Schedule / PR:** none. The skill is run on request by the agent, and CLAUDE.md tells the agent to open the PR with `gh`.

### Visual and a11y checks

- `axe.yml` is al-folio's workflow. It is `workflow_dispatch` only (push/PR triggers are commented out) and runs `@axe-core/cli` with chromedriver against the built site.
- `broken-links.yml` runs lychee on push/PR for content paths. `broken-links-site.yml` runs lychee offline on the built site after each successful deploy.
- `prettier.yml` blocks unformatted PRs. There is also `codeql.yml` and a pre-commit config (trailing whitespace, YAML check, large files).
- There is no screenshot script; screenshots are an instruction only.

**Worth porting:** the skill's pattern for adding papers safely: back up, fetch, merge instead of replace, sanity-check counts, keep a DOI exclusion list with comments, warn on entries with no lab author and ask the user, validate, report the diff. Also the CLAUDE.md "verify IDs via API" and EXIF-stripping rules.

---

## 3. suvitca/barnard-ladr (Barnard College, LADR Lab)

**License:** none.

**Agent files:** `CLAUDE.md` only ("Notes for Claude Code", 6 bullets, about 1 KB). No `.claude/`, no `AGENTS.md`.

### CLAUDE.md (full rules)

- "Content lives in `src/_data/*.yml`; prefer editing data over templates. Keep the instruction comments at the top of each YAML file intact. The PI edits these by hand on github.com."
- "One layout only ... Don't add new page types or layouts; the PI wants every page to feel like part of one site".
- Images and files are referenced by bare file name and resolved with the `img`/`file` filters, "which fall back to the old Columbia site if a file isn't in `src/assets/` yet."
- Root-relative links are rewritten to relative links at build time ("Don't hard-code a path prefix").
- Design tokens are in `:root`; the file names the fonts.
- "Check work with `npm run build`, and preview with `npm start`."

### Editing instructions atop data files

Each YAML file in `src/_data/` (publications, people, news, projects, site) starts with a boxed comment that gives a copy-paste template and field rules. Example from `publications.yml`:

```
#  To ADD a paper, copy this template to the TOP of the list:
#  - year: 2026
#    authors: "Lastname, A., B. Lastname, and A. Senghas"
#    ...
#    pdf: "lastname2026.pdf"     # put the PDF in src/assets/files/papers/
#  year can also be text like "In press".
#  type: talk   → listed under "Talks & posters" instead.
```

`people.yml` explains how to add, move to former, and remove members, and says "Everything except name and group is optional." The README has a "no coding needed" github.com pencil-edit workflow, a file-to-content table, and a YAML tip: "If the site stops updating after an edit, open the **Actions** tab ... A red ✗ shows the line with the problem."

**Automation and tests:** none. CI is deploy only (`npm ci && npm run build`).

**Worth porting:** the "Keep the instruction comments at the top of each YAML file intact" rule together with the self-documenting data-file headers, so a successor or PI can edit on github.com without docs.

---

## 4. harvardSys/harvardsys.github.io (Harvard Systems Group)

**License:** none. The theme submodule `HarvardSys/hugo-paper` is MIT.

**Agent files:** `CLAUDE.md` (6.7 KB). No `.claude/`, no `AGENTS.md`. Human docs are in `docs/` (`new-post.md`, `post-checklist.md`, `figures.md`, `preview-deployments.md`).

### CLAUDE.md structure

The file starts with the standard `/init` header ("This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository."). Sections: Overview, Commands, Deployment, Architecture, Authoring conventions. Useful rules:

- "Hugo **skips pages whose `date` is in the future**, and CI only builds on push — so a future `date` may never render on the live site. For new posts and seminars, set `date` to the current hour".
- "There is no test/lint step — the build must simply succeed." and "`public/` is generated output; never edit it by hand".
- The theme override layer: "decide deliberately whether to override in root `layouts/` (site-specific) or edit the theme submodule (upstream)."
- The people page is data-driven from `data/people.yaml`, and its role order is hard-coded: "a new role string will not appear until added to `$section_order`".
- Seminar authoring is spelled out precisely, including tone: "keep it brief ... and don't default to em dashes; prefer commas/colons", and "Do not add mailing-list/contact boilerplate to the page".
- Figures: "To check figures, look at ~390px and ~1440px widths."

`docs/post-checklist.md` is a human checklist. It includes "Figures readable on phone and laptop: View the post at ~390px wide ... nothing should scroll sideways".

**Preview tooling:** `preview.yml` publishes every pushed branch to a Cloudflare Worker and comments the preview URL on the PR. Per the docs, it "is inert until two repository secrets exist. Until then it logs a warning and exits successfully, so it never blocks a pull request."

**Publication automation, a11y and screenshot tests:** none.

**Worth porting:** the CLAUDE.md habit of documenting non-obvious generator traps (the future-date rule, hard-coded ordering) as explicit agent rules. The per-branch preview URL is useful if the successor reviews on a phone. It needs a Cloudflare account, so it is optional.

---

## 5. serre-lab/Lab-Website (Brown, Serre Lab)

**License:** none.

**Agent files:** `CLAUDE.md` (7.9 KB), `AGENTS.md` (291 bytes) and `.cursorrules` (86 bytes). No `.claude/`.

- `AGENTS.md` in full: "<!-- Pointer for Codex and other agents that auto-load AGENTS.md rather than CLAUDE.md. --> **Read `CLAUDE.md` in this directory first.** It is the source of truth for this project's context, conventions and instructions. Do not keep a second copy of those rules here — they will drift."
- `.cursorrules`: "Read CLAUDE.md in this directory for project context, conventions, and instructions."

### CLAUDE.md structure

1. **Accessibility: WCAG 2.1 AA Compliance (Brown University Policy)**. It cites the policy and the deadline ("May 11, 2027 as the extended federal deadline (checked October 11, 2026)") and warns "Do not confuse automated checks with full conformance certification."
2. **Visual style**: dated, attributed decisions ("Thomas, October 10, 2026"), for example "Check the actual desktop and mobile appearance; passing accessibility tests alone does not establish visual consistency." and "Links have no underlines ... (Thomas, October 12, 2026)."
3. **Research writing**: audience and content rules, for example "Do not promote early exploratory projects to major research directions".
4. **Mandatory Checks for Every Change**: checklists for headings (single h1, no skipped levels, "Publication titles are NEVER <h1>"), structure (landmarks, labelled navs, skip link, `lang`), images (alt, `aria-hidden` on decorative images, iframe titles), contrast (4.5:1), keyboard focus, links, SPA focus management, and PDFs ("Do not host local PDFs unless they are tagged (PDF/UA compliant)"; "Prefer linking to publisher DOI").
5. **Testing**: the `npm` commands, "Run a Lighthouse accessibility audit before each deploy", and "Test keyboard navigation".
6. **Routing and sitemap.**
7. **Publications data**: "Edit only: `~/Work/personal/cv/data/publications_central.json`". The lab JSON is generated by two Python sync scripts that live on the PI's machine (`~/Work/agents/claude/.venv/`). "Metadata synchronization alone must not add unreviewed PDFs." PDF downloads are opt-in with `--fetch-pdfs`.

### Publication tooling (`scripts/`)

- `check-publication-links.mjs` fetches every publication link and compares the publisher page's `citation_title` > `og:title` > `<title>` with the title shown on the site, which catches links to the wrong paper. It sends a desktop-browser User-Agent string.
- Also: `check-publications.cjs` (missing links/PDFs), `validate-pdf-paths.py`, `compress_pdfs.py`, `generate-bibtex.py`, `download_publication_pdfs.py`.
- There is no schedule and no PR automation. The sync depends on one person's machine paths.

### Tests and CI

- Playwright with Chromium and Firefox projects; about 23 test definitions across 4 specs.
- `accessibility.spec.ts`:
  - axe with tags `wcag2a, wcag2aa, wcag21a, wcag21aa` on every route, with **zero** violations allowed at any impact level. It first forces lazy images to load.
  - a single `<h1>` per route, and "heading levels never skip"
  - reflow at 320 px, then again with `font-size: 200%`, then with WCAG text-spacing overrides (line-height 1.5, letter-spacing .12em, word-spacing .16em)
  - keyboard tests for animations, tables and the skip link
- `audit-interactions.spec.ts` runs at 1280 and 390 px with `reducedMotion: 'reduce'`.
- CI: `deploy.yml` runs no tests. `lighthouse-ci.yml` runs on push to main, sleeps 180 s, runs `treosh/lighthouse-ci-action@v12` against the live homepage, and writes the scores to the job summary. The Playwright suite runs locally only.

**Worth porting:** the one-line `AGENTS.md` pointer ("Do not keep a second copy"), the Playwright WCAG checks (heading order, 320 px reflow with 200% text and text spacing), and the publication link-title check script.

---

## 6. jameststroud/jameststroud.github.io (Georgia Tech, Stroud Lab)

**License:** none.

**Agent files:** none (no CLAUDE.md, AGENTS.md or `.claude/`). The repo has agent-produced audit records: `SEO_AUDIT.md` (30 KB), `VERIFICATION.md` (a fact-check of every citation against Crossref, "Checked 27 August 2026"), `INDEXING_PLAN.md`, and `mobile-audit/REPORT.md`.

### Weekly publication PR (`.github/workflows/update-publications.yml` + `scripts/update-publications.js`, 408 lines)

- **Schedule:** `cron: "17 13 * * 1"` (Mondays) plus `workflow_dispatch`. The workflow comment says: "If any turn up, open a pull request that adds them, for a person to check and merge. Nothing is published until then."
- **PR:** `peter-evans/create-pull-request@v8`, branch `automation/new-publications`, `delete-branch: true`, title "New publications and abstracts to check". The PR body is generated by the script (`--report`).
- **Data sources:**
  - the ORCID public API, `https://pub.orcid.org/v3.0/<orcid>/works` (anonymous): DOIs only
  - Crossref `works?filter=orcid:<id>&rows=1000&mailto=...`
  - Crossref per DOI for ORCID DOIs that are missing from that result
  - The User-Agent includes a mailto ("Crossref asks callers to identify themselves; this puts us in its "polite" pool").
- **Duplicate and misattribution guards:**
  - keeps only `journal-article` and `posted-content` types
  - skips corrections, errata, retractions and replies (title regex)
  - requires an author whose family name matches `/^stroud$/i` ("no author named Stroud")
  - dedupes by normalized DOI, then by normalized title ("same title already listed (DOI missing or different)")
  - detects preprint-to-published pairs via Crossref `relation.has-preprint` and flags the old preprint in the PR body ("You may want to delete that preprint entry")
  - each inserted entry starts with `# Added automatically from Crossref; check the details, then delete this line.`
  - re-parses the edited YAML and stops with "Refusing to write: the edited file did not parse as expected." if the entry count does not match
  - the PR body lists skipped works with reasons in a `<details>` block
- **Abstracts:** taken from Crossref JATS, then the OpenAlex `abstract_inverted_index`, then PubMed E-utilities. Results under 40 words are rejected. There is a 400 ms pause for NCBI ("three requests a second without an API key").
- **Robustness:** 3 retries with backoff on 429/5xx, `--dry-run`, and `--fixtures DIR` for offline tests.
- The data file `src/_data/publications.yaml` has a template header comment (same pattern as Barnard).

### Other checks

- `npm run check` (`scripts/check-index.js`) fails if a sitemap URL has `noindex`, or if paper pages and abstracts disagree on indexability.
- `scripts/draft-abstracts.js` drafts abstracts from lab PDFs into a separate `abstracts-draft.yaml` and "never touches `src/_data/abstracts.yaml`".
- `mobile-audit/REPORT.md` describes a one-off audit: "Headless Chromium (Playwright) captured full-page screenshots of 15 page types at 320, 360, 390, 430, 768 and 1024 ... plus 1280 and 1440", with metrics for scrollWidth, tap targets under 44 px, text under 12 px and input font size, plus Lighthouse 12 mobile. The before, after and compare JPGs are committed, but the capture script is not. The audit left a contrast failure to the owner: "**Not changed**: these tokens drive desktop too. Needs your input."
- There are no a11y tests in CI.

**Worth porting:** the weekly ORCID + Crossref script and its PR workflow (see the guard list above), especially the "delete this comment line after checking" marker and the refuse-to-write parse check.

---

## 7. humanbuildingsynergy/humanbuildingsynergy.github.io (Arizona, HUBS Lab)

**License:** a custom dual LICENSE: "SOFTWARE — MIT License" for `src/css`, `src/js`, templates, `eleventy.config.js` and `tools/`, and CC BY-NC 4.0 for content (`src/_data/**`, photos, prose). "Not licensed for reuse: portraits ... and HUBS / University of Arizona marks." GitHub reports NOASSERTION.

**Agent files:** none committed. `.gitignore` contains `# Local notes, not part of the site` / `CLAUDE.md`.

### Build-time publications (`src/_data/publications.js`, 340 lines)

- **Design:** "Nothing here is hand-maintained. Claim a paper in ORCID and the next build picks it up ... Corrections and exclusions live in src/_data/publications-overrides.yml, which is the only file you should need to touch."
- **Sources:** ORCID public API works (DOIs), then Crossref per DOI (slimmed to the fields used). Preprints come from the arXiv API by author name, because arXiv DOIs are DataCite DOIs and fail the Crossref lookup. Zenodo releases are linked to papers. The User-Agent includes the site URL and a mailto.
- **Cache:** `.cache/publications.json` and `.cache/preprints.json` are **committed**: "if ORCID or Crossref is unreachable the deploy still produces the list it had yesterday instead of an empty page." Only DOIs that are not cached are fetched. CI cannot commit the cache back (`contents: read`), so the committed cache only changes when someone builds locally and commits.
- **Overrides file:**
  - `exclude`: DOIs to drop. Examples: book chapters registered separately, and same-name strangers on arXiv ("If one by somebody else with the same name turns up, list its arXiv DOI here").
  - `extra`: DOIs not yet claimed in ORCID ("This list should shrink to nothing").
  - `fix`: per-DOI title, venue, kind or slug corrections.
  - `manual`: entries with no DOI.
- **Dedupe:** case-insensitive DOI set. arXiv preprints are folded into the journal entry when arXiv's `journalDoi` or the normalized title matches. Slugs are kept unique. Papers are sorted by Crossref `created` rather than `issued`, because "Elsevier assigns an issue months ahead".
- **Schedule:** `deploy.yml` runs on push, weekly `cron: "0 7 * * 1"` and manually. It publishes directly with **no PR**. The comment says "GitHub disables scheduled workflows after 60 days of repository inactivity and emails about it; re-enable from the Actions tab."

### Other automation

- `draft-news.yml` runs weekly. `tools/draft-news.mjs` compares the publication DOIs with the DOIs mentioned in `news.yml`. It matches on DOI because "Titles get reworded between acceptance and publication" and only considers papers newer than the latest news item. It opens a PR with stub entries: "**The wording is placeholder.** Rewrite each `text:` in the lab's own voice before merging".
- `links.yml` runs lychee weekly with `--accept 200,206,301,302,403,429,999` and excludes `taylorfrancis.com`. It reuses one issue. The comment explains: "Publishers behind bot protection answer a crawler with 403 while serving a browser normally: ACM, ASCE, ASME, MDPI, Wiley and EDP Sciences all do, and every doi.org link redirects to one of them."
- `tools/og-cards.mjs` renders social preview cards with headless Chrome from the built site and commits them.
- There are no a11y or screenshot tests.

**Worth porting:** the overrides file shape (`exclude` / `extra` / `fix` / `manual`) and the committed last-good cache, and the lychee accept-list rationale for publisher 403s.

---

## External API facts (checked 2026-11-17)

### DBLP

- **Live test.** One query to `https://dblp.org/search/author/api?q=Avi+Mendelson&format=json`, once with a generic custom User-Agent and once with curl's default. Both returned **HTTP 202 with an HTML page "Making sure you're not a bot!"** from **Anubis v1.27.0** (`"algorithm":"metarefresh","difficulty":1`) instead of JSON. The mirrors `dblp.uni-trier.de` and `dblp.dagstuhl.de` returned the same challenge, and so did a person XML URL and the FAQ pages. I did not try to pass the challenge.
- **FAQ.** The DBLP FAQ page itself ("How to use the dblp search API") was not readable: it is behind the same Anubis wall, and the WebFetch tool also got "Access Denied". Search-engine snippets of the FAQ entry "Am I allowed to crawl the dblp website?" (dblp1.uni-trier.de/faq/1474706.html) say crawling is allowed and that a "Rate limiting" section tells heavy users to download the XML dump. I could not confirm the exact current wording.
- **robots.txt** (fetched directly, not challenged): `Crawl-delay: 4`. It disallows `/search/publ`, `/search/author`, `/search/venue`, `/orcid`, `/doi`, and `/*.xml`, `/*.json`, `/*.bib`, `/*.ris`, `/rec/bib`, `/rec/xml`. It allows `/pid`, `/pers`, `/rec`, `/db`.
- **Bulk dump:** `https://dblp.org/xml/` returned 200 without a challenge. `https://dblp.org/xml/release/` redirects (301) to `https://drops.dagstuhl.de/entities/collection/10.4230/dblp.xml`.
- **Conclusion (fact only):** at test time, plain HTTP clients (curl, and by extension a GitHub Action using fetch/curl) could not get JSON from the DBLP search API. I did not test whether GitHub runner IPs are treated differently.

### ORCID public API

- **Live test:** one anonymous `GET https://pub.orcid.org/v3.0/expanded-search/?q=family-name:Mendelson+AND+given-names:Avi&rows=3` with `Accept: application/json` returned **200 JSON** with 2 matching records and no rate-limit headers.
- **Limits:** the ORCID FAQ "What are the API limits?" (info.orcid.org/ufaqs/what-are-the-api-limits/, dated 2022-11-14) gives:
  - Anonymous API: 12 requests/s, burst 40, **25,000 reads/day per IP**
  - Public API with registered client credentials: 12 requests/s, burst 40, **100,000 reads/day per client ID**
  - Requests over the burst get 503. "If you exceed the usage quota then you will be blocked from making further requests within the timeframe."
- **Terms:** "the ORCID Public API is free for non-commercial use by individuals"; "you may not make use of the Public API in connection with any revenue-generating product or service." A site banner notes that ORCID recently updated its Terms of Use (2026), and I did not re-read that document.

### OpenAlex

- **Docs:** help.openalex.org, "Rate limits and authentication", last updated 2026-11-16 (docs.openalex.org now 301-redirects there).
  - "you can make basic queries with no key at all."
  - A free key "raises your daily budget 10×" and is "required for cursor paging past the first page."
  - Per-second limits: 10 requests/s without a key, 30 with a free key, 50 on an annual plan.
  - 429 is returned for exceeding the daily budget, the per-second limit, or a new-account pace limit.
- **Live test:** one keyless `GET https://api.openalex.org/authors?search=Avi%20Mendelson&per_page=3` returned 200 JSON with headers `X-RateLimit-Limit: 1000`, `X-RateLimit-Limit-USD: 0.1`, `X-RateLimit-Credits-Used: 10`, `X-RateLimit-Cost-USD: 0.001`. The response `meta.notice` said: "No API key, so this request shares one free daily budget ($0.10) with everyone on your network's IP address. Get a free key with its own $1/day ...". So a keyless search costs 10 of 1,000 daily credits, about 100 searches per day **shared per IP**. On a GitHub-hosted runner, that IP is shared with other users.
- The `/rate-limit` endpoint requires a key ("You must provide a valid API key to check rate limit status").
- The notice also describes a `POST /api-keys` call with the user's email. I did not use it.
- The old `mailto=` "polite pool" parameter is not mentioned on the current rate-limits page. jameststroud's script still sends `mailto=`.

## Sources

- Repos (cloned 2026-11-17): github.com/tud-amr/website, github.com/patchlab-upenn/patchlab-upenn.github.io, github.com/suvitca/barnard-ladr, github.com/harvardSys/harvardsys.github.io, github.com/serre-lab/Lab-Website, github.com/jameststroud/jameststroud.github.io, github.com/humanbuildingsynergy/humanbuildingsynergy.github.io
- https://dblp.org/robots.txt (fetched), https://dblp.org/faq/How+to+use+the+dblp+search+API.html (Anubis-blocked), https://dblp1.uni-trier.de/faq/1474706.html (search snippet only)
- https://info.orcid.org/ufaqs/what-are-the-api-limits/
- https://help.openalex.org/how-to-use-the-api/rate-limits-and-authentication
