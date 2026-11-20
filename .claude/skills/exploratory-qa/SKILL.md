---
name: exploratory-qa
description: Two visitor subagents, happy-path and adversarial, explore the locally served build with Playwright CLI and report bugs the tests did not anticipate. Use after a ticket that changes templates, styles or behaviour, before opening its pull request, or when the Maintainer asks for exploratory QA.
---

# Exploratory QA

Two **visitors** explore the site in parallel: a happy-path visitor walks real journeys, an adversarial visitor tries to break navigation and layout. You confirm what they find and turn it into tests or issues.

**Local only.** The one host any browser in this skill opens is `http://localhost:8383`. External links are checked by reading their `href`. Each page is loaded a handful of times, at human pace.

## 1. Serve the build

Start the server in the background and wait until `http://localhost:8383/` answers:

```bash
node tests/support/build-and-serve.js 8383 tests/content .qa-site
```

It builds the **test content set**, which holds the edge-case content and is the content the slice tests assert against, so a finding converts straight into a slice test.

Done when: `curl -sI http://localhost:8383/` returns `200`, and `npx --no-install playwright-cli -s=check open --browser=chromium http://localhost:8383/` opens the page (then close it). If the browser is reported missing, run the install command the error names, once.

## 2. Send both visitors

Read [`happy-path.md`](happy-path.md), [`adversarial.md`](adversarial.md) and [`REPORT.md`](REPORT.md). Spawn two general-purpose subagents in one message, so they run in parallel. Each prompt is that visitor's file followed by `REPORT.md`, both verbatim, plus one line naming the pages and behaviour this ticket changed, to explore first.

Done when: both visitors have returned a report that lists every journey or attack in their file as walked, with its findings or "no findings".

## 3. Reproduce every finding

Repeat each finding's steps yourself with the `playwright-cli` skill (`open --browser=chromium`) against the same server, and look at its screenshot. A finding is **confirmed** when you see the same thing; otherwise drop it, and say so in your summary.

Done when: every finding is marked confirmed or dropped.

## 4. Handle every confirmed finding

- **In the ticket's scope** (caused by, or in the pages and behaviour of, the change under review): write a failing slice test for it, see it fail, then fix it. `CODING_STANDARDS.md` says what a good test asserts.
- **Everything else**: file an issue labelled `needs-triage` holding the finding's severity, URL, viewport and steps, with the screenshot described in words (`docs/agents/issue-tracker.md`). Search the open issues first, and comment on an existing one instead of filing a duplicate.

Done when: every confirmed finding has a test that now passes or an issue number.

## 5. Close down

Stop the server, close the sessions (`playwright-cli -s=happy close`, `-s=adversarial`, `-s=nojs`), and tell the Maintainer: findings confirmed, fixed, filed (with issue numbers) and dropped.
