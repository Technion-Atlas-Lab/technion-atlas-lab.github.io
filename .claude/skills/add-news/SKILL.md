---
name: add-news
description: Writes a News item, or a talk with the link to its recording. Use when the Maintainer asks to announce something on the News page.
---

# Add a News item

The fields, the file name and the quoting rule are in `content/SCHEMA.md`: the `news/<name>.md` section and the ground rules.

## 1. Sort what the Maintainer gave

Find each of these in the request:

- **What happened**, as facts: who, what, where.
- **Date**: the day of the event or announcement.
- **Recording**: for an event the request calls a talk, the link to its recording.
- **Related Members**: each person the request names who has a file in `content/members/` (`grep -H '^name:' content/members/*.md`). Anyone else is named in the body only.

Done when: each of the four is filled from the request, marked missing, or, for a recording, marked "not a talk".

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Date**, when missing. The date comes from the Maintainer; today's is a guess.
- **Recording**, when missing: ask for the link, or whether to publish the talk as `news` now and add the recording later. The type follows from the answer: `talk` with a recording, `news` without.
- **A related Member**, when a name in the request fits two files or fits one only loosely.
- **Placeholder or real**: when `grep -l 'Design-phase placeholder' content/news/*.md` prints a file, the site is in the Design phase: read `docs/agents/design-phase.md` and ask its question.

Done when: the date is a day of the calendar, the type is `talk` or `news` by the rule above, every related Member is one file name, and in the Design phase the Maintainer has said placeholder or real.

## 3. Write the file

Create `content/news/<file-name>.md`, the file name a few words of the title: `invited-talk-example-symposium.md`.

- **`title`**: a headline about what happened, not the talk's own name: `Invited talk at the Example Symposium: Containing Tool-Using Agents`.
- **`members`**: the related Members' file names, in the order the request names them.
- **The body**, under the front matter: one to three sentences of plain text, holding only facts from the request. It leaves out the related Members' names: the page lists them under "People:" right below it. A link other than the recording has no field: leave it out and tell the Maintainer.

When the item announces a Publication that `content/publications/` does not list, offer in one line to add it with the `add-publication` skill.

Done when: `npm run validate` passes, every fact in the title and body is one the Maintainer gave, the title is a headline, and the body names no related Member.

## 4. Open the pull request

The changed pages are `/news/` and `/people/<file-name>/` for each related Member who is a current Member.

Done when: the pull request is open and you have shown the Maintainer the title and body as written.
