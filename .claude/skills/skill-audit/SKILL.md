---
name: skill-audit
description: Runs every skill in .claude/skills/ on sample requests in throwaway worktrees and reports whether each works. Report only; nothing is committed, pushed or filed.
disable-model-invocation: true
---

# Skill audit

Each skill in `.claude/skills/` is run for real on a sample request, in a **throwaway** worktree, and its result is put through the repo's checks. The output is a report for the Maintainer. Everything the audit writes is throwaway: the live site changes only on a push to `main`, and the audit commits, pushes and files nothing.

## 1. Prepare

The audit tests the skills as committed at `HEAD`, so start from a clean checkout:

```bash
git status --short                     # must print nothing
mkdir -p .builds/skill-audit
git ls-remote --heads origin > .builds/skill-audit/remote-before.txt
gh issue list --state all --limit 1 --json number --jq '.[].number' > .builds/skill-audit/newest-issue.txt
gh pr list --state all --limit 1 --json number --jq '.[].number' >> .builds/skill-audit/newest-issue.txt
ls .claude/skills/
```

Sort every skill into one kind:

- **Content skill**: has a section in [`requests.md`](requests.md).
- **Tool skill**: `playwright-cli` and `exploratory-qa` (step 4).
- **New skill**: neither. Write a sample request, the Maintainer's answers and Expected lines for it, in the shape of `requests.md`; the report shows them, for the Maintainer to add to `requests.md`.
- `skill-audit` itself is not run.

Then write one **edge-case request** for one content skill: a case its fixed request and the other runs leave out (a name in another script, an Alumnus the site never listed, a Publication the Lab already lists, a Member credited nowhere, a News item with no related Member), with the answers you choose and its Expected lines.

Make a throwaway worktree for each content skill, each new skill and the edge case:

```bash
git worktree add -q --detach .claude/worktrees/audit-<name> HEAD
ln -s "$PWD/node_modules" .claude/worktrees/audit-<name>/node_modules
```

Done when: `git status --short` printed nothing, every skill in `.claude/skills/` has a kind, and each run has its worktree.

## 2. Run the skills

Spawn one general-purpose subagent per worktree, all in one message, so they run in parallel. Each prompt holds:

- "Read `.claude/skills/skill-audit/runner-brief.md`, in full, and do what it says. Your worktree is `<absolute path>`; the skill is `<name>`. Your reply is the report the brief describes.";
- the request and the Maintainer's answers, copied from `requests.md` or from step 1, after running inside that worktree any setup its section names.

Done when: every runner has returned a report holding each section the brief names.

## 3. Check each result

The test servers use fixed ports, so take the worktrees one at a time. In each: `npm run check`, then `npm run shots -- <the changed pages the runner named>`, and read every screenshot at 390, 768 and 1280 px. Compare the result with the request's **Expected** lines.

Done when: each worktree has its `npm run check` outcome, its screenshots read, and each Expected line marked met or missed.

## 4. Run the tool skills

- **`exploratory-qa`**: follow its `SKILL.md` steps 1 to 3, with "the whole site" as the pages to explore first. Its step 4 is replaced: list every confirmed finding in the report, with its steps and screenshot, and file and fix nothing.
- **`playwright-cli`**: while that server still runs, in a session named `audit`, run one command of each group the skill lists (open, snapshot, find, eval, resize, press, click, go-back, screenshot, console, requests, an emulation command, list, close), invoked as the skill writes them (bare `playwright-cli`; when it is missing, record that and run the README's one-time install). Then finish with `exploratory-qa`'s step 5.
- **The live sources of `add-publication`**: in a throwaway worktree made as in step 1 (`audit-sources`), `npm run add-publication -- https://doi.org/10.1145/3133956.3134077 --area <an area the command lists>` and the same with `https://arxiv.org/abs/1706.03762`. Each writes a file, or answers that the Lab already lists the Publication; both mean the source answered.

Done when: `exploratory-qa`'s step 5 Done-when holds (its summary goes into this report, step 7), every `playwright-cli` command group ran or its error is recorded, and both live sources answered or their error is recorded.

## 5. Confirm every defect

For each defect a runner reported, and each missed Expected line, read the skill's text and the file the runner wrote, and repeat what failed. A defect is **confirmed** when you see it yourself; otherwise it is **dropped**.

Done when: every defect is marked confirmed or dropped.

## 6. Clean up

```bash
fuser -k 8383/tcp
for s in audit check main happy adversarial nojs; do playwright-cli -s=$s close; done
for w in .claude/worktrees/audit-*; do
  [ "$(git -C "$w" rev-parse HEAD)" = "$(git rev-parse HEAD)" ] || echo "COMMIT MADE in $w"
  git worktree remove --force "$w"
done
git ls-remote --heads origin | diff .builds/skill-audit/remote-before.txt -
{ gh issue list --state all --limit 1 --json number --jq '.[].number'; gh pr list --state all --limit 1 --json number --jq '.[].number'; } | diff .builds/skill-audit/newest-issue.txt -
rm -rf .builds/skill-audit .builds/qa
```

Done when: `git worktree list` shows no `audit-` worktree, `git status --short` prints nothing, the loop printed no `COMMIT MADE`, both `diff`s printed nothing or only branches, issues or pull requests another session made (name them in the report), `playwright-cli list` shows none of the audit's sessions, and nothing answers on port 8383.

## 7. Report

Tell the Maintainer, in this order:

1. A table: each skill, **pass** or **defects** (or **blocked**, with what blocked it), and the evidence (`npm run check` counts, the Expected lines met).
2. Each confirmed defect: the skill, the line quoted, what happened, and the fix it suggests.
3. The dropped defects, one line each.
4. `exploratory-qa`'s confirmed site findings, and the open issues it named as already known.
5. The edge-case request, any new skill's request, and the answers you chose for them.
6. The clean-up proof from step 6.

Done when: the Maintainer has the report. Fixes wait for the Maintainer to ask for them.
