## Shared agent workflow

The next Maintainer inherits this repo's agent workflow through git, so the workflow lives entirely in the repo:

- Commit every agent-facing file in the same pull request as the change that needs it: `CLAUDE.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`, `.claude/skills/`, `.claude/settings.json`.
- Declare every plugin the workflow relies on in `.claude/settings.json`; Claude Code offers to install it when someone trusts the folder.
- Keep personal preferences in `.claude/settings.local.json` (git-ignored).

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (`Technion-Atlas-Lab/technion-atlas-lab.github.io`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
