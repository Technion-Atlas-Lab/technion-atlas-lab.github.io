## Shared agent workflow

The next Maintainer inherits this repo's agent workflow through git, so the workflow lives entirely in the repo:

- Commit every agent-facing file in the same pull request as the change that needs it: `CLAUDE.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`, `docs/research/`, `.claude/skills/`, `.claude/settings.json`.
- Declare every plugin the workflow relies on in `.claude/settings.json`; Claude Code offers to install it when someone trusts the folder.
- Keep personal preferences in `.claude/settings.local.json` (git-ignored).

## Research

Before work on accessibility, privacy, security or Technion requirements, or when porting a feature from another lab's site, read the matching note in `docs/research/`: `compliance-research.md` (Israeli law and Technion rules, with sources), `tdk-inventory.md` and `adesnik-inventory.md` (the two reference sites), `agent-tooling-survey.md` (other labs' agent setups and publication APIs), `lab-website-report.md` (the wider list of reference lab sites).

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (`Technion-Atlas-Lab/technion-atlas-lab.github.io`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
