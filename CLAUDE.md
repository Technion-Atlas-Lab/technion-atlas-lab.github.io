## Shared agent workflow

The next Maintainer inherits this repo's agent workflow through git, so the workflow lives entirely in the repo:

- Commit every agent-facing file in the same pull request as the change that needs it: `CLAUDE.md`, `CODING_STANDARDS.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`, `docs/research/`, `.claude/skills/`, `.claude/settings.json`.
- Declare every plugin the workflow relies on in `.claude/settings.json`; Claude Code offers to install it when someone trusts the folder.
- Keep personal preferences in `.claude/settings.local.json` (git-ignored).

## Branches

Commit on a branch and open a pull request, even when a skill says to commit to the current branch. `main` accepts only pull requests whose two checks pass, "Validate, build, check links and test" and "Site-wide checks", with no reviewer; the rule binds admins too.

## Skill protocol

1. Use the skill that matches the task (`.claude/skills/`, or one from the plugin).
2. With no matching skill, ask the Maintainer only the judgment calls, in one round, then do the work.
3. Afterwards, offer in one line to save the workflow as a skill in `.claude/skills/`; write it only when the Maintainer agrees.

## Before you finish any change

Every change that adds or alters a page slice goes red → green → refactor: a failing test first, the slice built until it passes, then cleanup with all tests green. A change is finished when each of these has passed, in order:

1. `npm run validate`
2. `npm run lint`
3. `npm run build`
4. `npm run linkcheck`
5. `npm test`
6. `npm run test:site`
7. Each changed page inspected with the `playwright-cli` skill at 390, 768 and 1280 px.
8. For a ticket that changes templates, styles or behaviour: the `exploratory-qa` skill run, and every finding handled as it says.

## Rules

- **No third-party requests.** Every file a page loads (fonts, scripts, images, styles) is served from the site itself; videos and maps are plain links.
- **Consent.** Add a Profile field only when the Maintainer states that the person gave Consent for it. The repository is public and its history is permanent.
- **Photos** are committed stripped of all embedded metadata, including location.
- **GLOSSARY terms.** Names, messages, docs and page text use the terms in `GLOSSARY.md`; a new domain term goes into it in the same change.

`CODING_STANDARDS.md` holds the rules a reviewer applies, with their reasons.

## Research

Before work on accessibility, privacy, security or Technion requirements, or when porting a feature from another lab's site, read the matching note in `docs/research/`: `compliance-research.md` (Israeli law and Technion rules, with sources), `tdk-inventory.md` and `adesnik-inventory.md` (the two reference sites), `agent-tooling-survey.md` (other labs' agent setups and publication APIs), `lab-website-report.md` (the wider list of reference lab sites).

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (`Technion-Atlas-Lab/technion-atlas-lab.github.io`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
