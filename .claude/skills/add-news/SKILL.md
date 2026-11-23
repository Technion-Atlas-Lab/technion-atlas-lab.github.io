---
name: add-news
description: Writes a News item as a file in content/news/, a talk with the link to its recording. Use when the Maintainer asks to announce something on the News page, such as a talk, a visit, an award or an accepted Publication.
---

# Add a News item

The fields are in the `news/<name>.md` section of `content/SCHEMA.md`.

## 1. Sort what the Maintainer gave

Find each of these in the request:

- **What happened**, as facts: who, what, where.
- **Date**: the day of the event or announcement.
- **Recording**: a link to a recording. With one, the item is a `talk`; without one it is `news`, whatever the event was.
- **Related Members**: each person the request names who has a file in `content/members/` (`grep -H '^name:' content/members/*.md`). Anyone else is named in the body only.

Done when: each of the four is filled from the request or marked missing.

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Date**, when missing. Today's date is a guess: ask.
- **Recording**, when the request calls the event a talk and gives no link: ask for the link, or whether to publish it as `news` now and add the recording later.
- **A related Member**, when a name in the request fits two files or fits one only loosely.
- **Design phase**: when `grep -l 'Design-phase placeholder' content/news/*.md` prints a file, the site may hold only placeholder content. Ask whether this item is a placeholder, or a real one to add before Design approval all the same.

Done when: the date is a day of the calendar, the type is settled, every related Member is one file name, and in the Design phase the Maintainer has said placeholder or real.

## 3. Write the file

Create `content/news/<file-name>.md`, the file name a few words of the title in lowercase ASCII letters, digits and hyphens: `invited-talk-example-symposium.md`.

- **`title`**: what happened, as a headline; in double quotes when it holds a colon.
- **`date`**, **`type`**, and for a talk **`recording`**.
- **`members`**: the related Members' file names, in the order the request names them. The page names them under the title, so the body need not list them again.
- **The body**, under the front matter: one to three sentences of plain text, holding only facts from the request. A link other than the recording has no field: leave it out and tell the Maintainer.
- **A placeholder** (step 2) opens with the comment its neighbours open with: `# Design-phase placeholder, not a real talk. Replace in the Content phase.`, or `not real News` for news.

When the item announces a Publication that `content/publications/` does not list, offer in one line to add it with the `add-publication` skill.

Done when: `npm run validate` passes, and every fact in the title and body is one the Maintainer gave.

## 4. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/news/` and `/people/<file-name>/` for each related Member who is a current Member.

Done when: the pull request is open and the Maintainer has read the title and body as written.
