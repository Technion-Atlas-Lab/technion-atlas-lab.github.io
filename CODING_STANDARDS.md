# Coding standards

The rules a reviewer applies to every change. They are judgement calls: CI already enforces what a machine can check (validation, lint, build, link check, slice tests, site-wide checks). Each rule gives its reason, so a reviewer can tell when it bends. The full design is in spec #32 (`gh issue view 32`); the Lab's terms are in `GLOSSARY.md`.

## Tests

- **Assert what a visitor perceives**: headings, text, links, roles, accessible names, navigation results and layout. Locate elements by role, name or text. A test tied to CSS classes, template structure or file layout breaks on a refactor that changes nothing a visitor sees.
- **Slice tests read only the test content set** (`tests/content/`), so real content can change without breaking them. Expected values are literals from that set or from the spec, never recomputed the way the code computes them.
- **Site-wide checks (`tests/site-wide/`) hold for any content**: they read the real content and assert nothing about what a page says.
- **Red, green, refactor.** Each slice is built in that order: a test seen failing, the slice built until it passes, then cleanup with every test green. A new site-wide check, or a check the slice tests cannot reach, is shown able to fail by an injected fault, then reverted; the commit message or PR records the fault.
- **Tests stay on the machine.** ORCID, Crossref, arXiv and every other external service are replaced by recorded responses.

## The site

- **Every file the site loads is its own (no third-party requests)**: fonts, scripts, images and styles are self-hosted; videos and maps are plain links. The Content Security Policy meta tag stays the first thing in `<head>` that could load anything. Privacy law and the Technion rules require it (`docs/research/compliance-research.md`).
- **JavaScript is the mobile menu toggle only**, and every page reads fully with JavaScript off.
- **Plain CSS with custom properties**: every colour lives in `:root` at the top of `src/assets/site.css`; fonts are the system stack.
- **Links and assets use root-relative URLs** (`/assets/...`, `/about/`). GitHub Pages serves the page-not-found page at any address, so a relative URL breaks there.
- **A person's data is committed only with that person's Consent**: a Profile field is added only when the Maintainer states that the person gave Consent for it, and so is a student's name on a Student Project. The repository is public and git history is permanent. A committed photo may keep its embedded metadata (the Maintainer's decision); the build strips the published copy.

## Code

- **Each file opens with a plain-English comment** saying what it is for and who uses it. Comments explain why (`Eleventy never deletes from its output folder, so ...`), not what the next line does.
- **Names, messages, docs and page text use the GLOSSARY terms** (Member, Profile, Publication, Research Area, Maintainer, test content set, ...). A new domain term goes into `GLOSSARY.md` in the same change.
- **A lint rule is turned off only with a comment giving the reason**, in `eslint.config.js` or beside the `eslint-disable` line, so the next person can tell a deliberate exception from a silenced bug.
- **A generated build goes under `.builds/`** (`.builds/test`, `.builds/qa`, ...), which git and the lint ignore as a whole; only the published site is built into `_site/`.
- **Shared behaviour has one home in `lib/`; reuse it**: each file there opens with a comment saying what it owns. Code that does the same job elsewhere (a template, a tool, a test helper) calls it instead.
- **The validation rules live in two places that change together**: `SCHEMA` in `lib/content.js` and `content/SCHEMA.md`.
- **Error messages name the file and the problem in plain English**, so the Maintainer can fix content without reading code (`content/site.yaml: missing required field "name"`).

## Docs

- **Agent-facing files are reviewed against the `writing-for-agents` skill** (`CLAUDE.md`, `.claude/skills/`, `docs/agents/`): one home for each meaning, a completion criterion on every step, no instruction the agent already follows by default.
- **The README tracks the change**: a new or renamed command updates its Commands table; a new place to edit something updates "To change X, edit file Y".
- **CI job names are part of the merge rule.** Renaming a job in `.github/workflows/site.yml` needs the branch protection rule on `main` updated to match, or every pull request waits forever on the old name.
