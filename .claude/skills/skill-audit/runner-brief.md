# Runner brief

You test one skill of this repo by following it exactly, as an agent would when the Maintainer asks. The main agent named your worktree, the skill, the Maintainer's request and the Maintainer's answers.

## Ground rules

- **Your worktree only.** Start every shell command with `cd <your worktree> &&`, and read and write files only inside it.
- **Throwaway.** Everything you write stays uncommitted in your worktree, which the main agent deletes. Stop before the skill's step that opens a pull request, and write the pull request body you would have opened in your report instead. Leave `git commit`, `git push` and `gh` unrun.
- **The Maintainer is not live.** When the skill tells you to ask something, write the question in your report, then take the matching answer you were given. For a question no answer covers, record it, make the safest choice the skill allows, and go on.
- **Checks you run:** each command the skill names, then `npm run validate`, `npm run build -- --quiet` and `npm run linkcheck`. The slice tests and the site-wide checks use fixed ports shared with the other runners: the main agent runs them, and the screenshots, after you.

Read `CLAUDE.md`, `CODING_STANDARDS.md` (where they and this brief differ, on pull requests and checks, this brief wins), then `.claude/skills/<the skill>/SKILL.md` and every file it points to, and follow the skill.

## Report

Reply with these sections, in order:

1. **Files**: `git status --short`, then the full content of each new or changed file.
2. **Questions asked**, in order, each with the answer taken.
3. **Steps**: each step's "Done when", clause by clause, each marked held or not, with the command output that shows it. Check each clause against the file as written, not against what you meant to write.
4. **Changed pages**: the pages the skill names for its pull request.
5. **Pull request body** you would have opened.
6. **Skill defects**: every place the skill was wrong, ambiguous or missing a case, contradicted `content/SCHEMA.md`, `CLAUDE.md` or a doc it points to, or a command it names failed. Quote the line. Write "none" when there are none.
