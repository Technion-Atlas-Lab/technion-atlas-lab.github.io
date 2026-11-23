---
name: move-to-alumni
description: Turns a current Member who has left the Lab into an Alumnus, keeping their Publications and News credited. Use when the Maintainer says a Member graduated, left the Lab, or should move to the Alumni.
---

# Move a Member to the Alumni

The Alumnus fields and their formats are in the `members/<name>.md` section of `content/SCHEMA.md`.

## 1. Find the Member

Find the file in `content/members/` whose `name` the Maintainer means (`grep -H '^name:' content/members/*.md`), and list the Publications and News items that name it, where `<file-name>` is the file's name without `.md`:

```bash
grep -rnE " <file-name> *$" content/publications content/news
```

Done when: exactly one file is chosen, its `role` is any but `Alumnus`, and the items are listed for step 4; a Member credited nowhere gives no output. With no match or several, ask the Maintainer which.

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Year** the person left the Lab; propose the current year.
- **Current position**: what it is, and whether the person gave Consent to publish it. It is a Profile field, so the position alone is not Consent; without Consent, the field is left out.

Done when: the year is settled, and the current position is settled with Consent or left out.

## 3. Edit the file in place

The file keeps its name: Publications and News name the person by it, which is what keeps them credited.

- `former_role`: the role the Member held. Then `role: Alumnus`, `year`, and `current_position` when settled.
- `order`: by the Alumni rule in the `order` row of `content/SCHEMA.md`, with the person last among those of their year. Renumber the other Alumni files to match: with Alumni of 2025, 2024 and 2023 numbered 1, 2, 3, a person leaving in 2026 becomes 1 and the others 2, 3, 4. The role group the person left keeps its numbers; a gap is fine.
- The file ends holding what the Alumni row shows: `name`, `role`, `order`, `former_role`, `year`, and `photo` and `current_position` when it has them. Remove every other field and the bio: an Alumnus has no Profile page to publish them on.

Done when: `npm run validate` passes, the file is still at the same path, and `git status --short` lists only files in `content/members/`.

## 4. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/people/`, `/research/`, `/news/` and the Profile of each current Member who shares an item listed in step 1: the person is in the Alumni, and their name on each of those items is plain text where it was a link. Their Profile page is gone; `npm run check` fails on any link still leading to it.

Done when: the pull request is open and its body says whether the current position was published with Consent.
