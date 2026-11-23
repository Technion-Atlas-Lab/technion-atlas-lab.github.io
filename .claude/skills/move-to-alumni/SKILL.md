---
name: move-to-alumni
description: Turns a current Member who has left the Lab into an Alumnus, keeping their Publications and News credited. Use when the Maintainer says a Member graduated, left the Lab, or should move to the Alumni.
---

# Move a Member to the Alumni

The Alumnus fields and their formats are in the `members/<name>.md` section of `content/SCHEMA.md`.

## 1. Find the Member

Find the file in `content/members/` whose `name` the Maintainer means, and record what names it:

```bash
grep -rn "<file-name>$" content/publications content/news
```

Done when: exactly one file is chosen, its `role` is a current Member's, and the grep's output is saved for step 3. With no match or several, ask the Maintainer which.

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Year** the person left the Lab; propose the current year.
- **Current position**: a Profile field, so it is written only when the Maintainer says the person gave Consent to publish it. Without Consent, the field is left out.

Done when: the year is settled, and the current position is settled with Consent or left out.

## 3. Edit the file in place

The file keeps its name: Publications and News name the person by it, which is what keeps them credited.

- `former_role`: the role the Member held. Then `role: Alumnus`, `year`, and `current_position` when settled.
- `order`: the Alumni are listed by most recent `year` first. Give the person their place by that rule and renumber the other Alumni files to match; within one year, keep the order already there and put the person last.
- Remove every other field except `name` and `photo`, and remove the bio. An Alumnus has no Profile page, so the site publishes none of them, and Consent covered publishing them on the Profile.

Done when: `npm run validate` passes, `git status --short` lists only files in `content/members/`, and the grep from step 1 prints the same lines as before.

## 4. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/people/`, `/research/` and `/news/`: the person is in the Alumni, and their name on each Publication and News item is plain text where it was a link. Their Profile page is gone; `npm run check` fails on any link still leading to it.

Done when: the pull request is open and its body says whether the current position was published with Consent.
