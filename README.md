# ATLAS Lab website

Source for the ATLAS Lab (Technion) website, published with GitHub Pages at
https://technion-atlas-lab.github.io

## Working on this site with Claude Code

This site is built to be maintained with a coding agent. Everything the agent uses is committed
here, so a new Maintainer gets the whole workflow by cloning the repo:

- `CLAUDE.md`: the agent's instructions for this repo.
- `GLOSSARY.md`: the Lab's vocabulary (Member, Publication, Research Area, ...).
- `docs/adr/`: why the big decisions were made.
- `docs/agents/`: how agents use the issue tracker, triage labels and domain docs.
- `docs/research/`: the research behind the site: Israeli accessibility and privacy law,
  Technion rules, the reference lab sites, and other labs' agent setups.
- `.claude/skills/`: the site's own skills, added as the site is built.
- `.claude/settings.json`: enables the `mattpocock-skills` plugin. Claude Code offers to install
  it the first time you trust this folder.

The usual flow: an idea or issue → `/grill-with-docs` → `/to-spec` → `/to-tickets` → implement
each ticket test-first (`/tdd`) → pull request. Colleagues' bug reports and ideas arrive as issues
and go through `/triage`.
