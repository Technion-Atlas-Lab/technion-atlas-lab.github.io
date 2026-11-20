---
name: exploratory-qa
description: Two visitor subagents, happy-path and adversarial, explore the locally served build with Playwright CLI and report bugs the tests did not anticipate. Use after a ticket that changes templates, styles or behaviour, before opening its pull request, or when the Maintainer asks for exploratory QA.
---

# Exploratory QA

The ground rules in [`visitor-brief.md`](visitor-brief.md) bind you as well as the visitors.

## 1. Serve the build

Start the server in the background:

```bash
node tests/support/build-and-serve.js 8383 tests/content .qa-site
```

It builds the test content set, the content the slice tests assert against, so a finding converts straight into a slice test.

Done when: `curl -sI http://localhost:8383/` returns `200`, and the open command in `visitor-brief.md` opens the page in a session named `check` (then close it). If the browser is reported missing, run the install command the error names, once.

## 2. Send both visitors

Read [`happy-path.md`](happy-path.md), [`adversarial.md`](adversarial.md) and `visitor-brief.md`. Spawn two general-purpose subagents in one message, so they run in parallel. Each prompt is that visitor's file followed by `visitor-brief.md`, both verbatim, plus one line naming the pages and behaviour this ticket changed, to explore first.

Done when: both visitors have returned a report that lists every journey or attack in their file as walked, with its findings or "no findings", or as blocked with what is missing.

## 3. Reproduce every finding

Repeat each finding's steps yourself against the same server, in a session named `main`, and look at its screenshot. A finding is **confirmed** when you see the same thing; otherwise it is **dropped**. Treat each entry under a visitor's "Unconfirmed" heading the same way. Dropped findings are listed in your summary and filed nowhere.

Done when: every finding and every unconfirmed entry is marked confirmed or dropped.

## 4. Handle every confirmed finding

- **In the ticket's scope** (caused by, or in the pages and behaviour of, the change under review): write a failing slice test for it, see it fail, then fix it.
- **Everything else**: file an issue labelled `needs-triage` holding the finding's severity, URL, viewport and steps, with the screenshot described in words (`docs/agents/issue-tracker.md`). Search the open issues first, and comment on an existing one instead of filing a duplicate.

Done when: every confirmed finding has a test that now passes or an issue number.

## 5. Close down

Stop the server, close every session, and tell the Maintainer which findings were confirmed, fixed, filed (with issue numbers) and dropped.

Done when: `curl -sI http://localhost:8383/` fails to connect, `npx --no-install playwright-cli list` shows no open browser, and the Maintainer has the summary.
