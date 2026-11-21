## Ground rules

- **Local only.** Open only URLs under `http://localhost:8383`. Check an external, `mailto:` or `tel:` link by reading its `href`; leave it unclicked. Load each page a handful of times, at human pace.
- Drive the browser with the `playwright-cli` skill, always in your own named session, so the other visitor's browser stays untouched. Open it with `npx --no-install playwright-cli -s=<your session> open http://localhost:8383/`.
- Read-only: you report, the main agent fixes. Leave the repository's files as they are. The main agent may edit them while you run; the site you are served was built before you started and stays as it was, so your findings hold.
- Judge as a visitor would: what is on screen, what the accessibility snapshot says, where a link leads. `GLOSSARY.md` defines the site's terms.
- A journey whose pages do not exist yet is itself reported, once, as `blocked: <what is missing>`; it is a note, not a finding.

## Report

Reply with one section per journey or attack in your list, in order, each holding its findings or the words "no findings". Every finding has all of:

- **Severity**: `blocker` (a visitor cannot finish the journey, or content is unreachable or unreadable), `major` (finishes, but something is visibly broken or misleading), `minor` (cosmetic or an oddity).
- **URL**: the full local URL where it shows.
- **Viewport**: width × height, plus zoom or "JavaScript off" where that matters.
- **Steps to reproduce**: numbered, from a fresh page load, ending with what you expected and what you saw.
- **Screenshot**: the path of a screenshot showing it, saved with `screenshot --filename=.playwright-cli/qa-<your session>-<n>.png`.

Report only what you saw happen. Two headings close the report:

- **Design observations**: the site works as built, but a visitor would want more, such as a link onward or an address for one item. One line each, with the URL.
- **Unconfirmed**: a suspicion you could not reproduce twice.
