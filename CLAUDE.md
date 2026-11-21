## Shared agent workflow

The next Maintainer inherits this repo's agent workflow through git, so the workflow lives entirely in the repo:

- Commit every agent-facing file in the same pull request as the change that needs it: `CLAUDE.md`, `CODING_STANDARDS.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`, `docs/research/`, `.claude/skills/`, `.claude/settings.json`.
- Declare every plugin the workflow relies on in `.claude/settings.json`; Claude Code offers to install it when someone trusts the folder.
- Keep personal preferences in `.claude/settings.local.json` (git-ignored).

## Branches

Commit on a branch and open a pull request, even when a skill says to commit to the current branch. `main` accepts only pull requests whose two checks pass, "Validate, build, check links and test" and "Site-wide checks", with no reviewer; the rule binds admins too.

## Skill protocol

1. Look for a matching skill first (`.claude/skills/`, then the plugin's). A skill is the Maintainer's settled way to do that task: follow it.
2. With no matching skill, ask the Maintainer only the judgement calls, in one round, then do the work.
3. Afterwards, offer in one line to save the workflow as a skill in `.claude/skills/`; write it only when the Maintainer agrees.

## Before you finish any change

A change is finished when each of these has passed, in order:

1. `npm run check`, which runs the scripts `validate`, `lint`, `build`, `linkcheck`, `test` and `test:site` in order and stops at the first that fails.
2. Each changed page's screenshots read at 390, 768 and 1280 px (`npm run shots -- /people/` saves them to `.shots/`). A change in behaviour (menu, focus, keyboard) is also walked in a browser with the `playwright-cli` skill.
3. For a ticket that changes templates, styles or behaviour: the `exploratory-qa` skill run, and every finding handled as it says.

A slice is built red → green → refactor (`CODING_STANDARDS.md`, Tests).

## Rules

`CODING_STANDARDS.md` is the one home of the rules, with their reasons; read it before the first edit of a session. Four of them decide what may enter the repository at all: no third-party requests, Consent, photo metadata, GLOSSARY terms.

## Research

Before work on accessibility, privacy, security or Technion requirements, or when porting a feature from another lab's site, read the matching note in `docs/research/`: `compliance-research.md` (Israeli law and Technion rules, with sources), `tdk-inventory.md` and `adesnik-inventory.md` (the two reference sites), `agent-tooling-survey.md` (other labs' agent setups and publication APIs), `lab-website-report.md` (the wider list of reference lab sites).

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (`Technion-Atlas-Lab/technion-atlas-lab.github.io`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
