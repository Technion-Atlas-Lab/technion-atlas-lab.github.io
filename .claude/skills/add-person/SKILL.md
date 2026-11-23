---
name: add-person
description: Adds a person to the Lab's site. Use when the Maintainer asks to add a Member, or an Alumnus the site never listed.
---

# Add a person

The fields, their formats and the roles are in the `members/<name>.md` section of `content/SCHEMA.md`. Two branches have their own home: a photo ([`photo.md`](photo.md)) and an Alumnus (the last section here).

## 1. Sort what the Maintainer gave

Put every detail in the request under one of three headings:

- **Stated**: the name, and the role when given.
- **With Consent**: each Profile field the Maintainer says the person gave Consent for.
- **Consent unstated**: each Profile field given with no word on Consent.

The bio and the photo are Profile fields too. A statement of Consent covers the fields it names; a field given in another sentence is "Consent unstated".

Done when: every detail about the person in the request is under one heading.

## 2. Ask once

Ask, in one round, only what the request left open:

- **Role**, when it was not given.
- **Order**: print the role group as it stands (`grep -l '^role: <role>' content/members/*.md | xargs grep -H -E '^(name|order):'`), propose the place after the last (the highest `order` plus one, or 1 in an empty group), and ask whether that is right.
- **Consent**, for each field under "Consent unstated", named in plain words: "Did <name> give Consent to publish their GitHub link and bio?" A field the Maintainer cannot confirm is dropped.
- **File name**: the person's name without a title, in lowercase ASCII letters with hyphens (`Dr. Ada Lovelace` becomes `ada-lovelace`). Publications and News name the person by it, so it is chosen once, for good. It needs a question in two cases: a name written in another script (ask for its Latin spelling), or a file that already exists (ask for another name).

Done when: the role, the order and the file name are settled, and every field is under "With Consent" or dropped.

## 3. Write the file

Create `content/members/<file-name>.md` holding `name` (with its title), `role`, `order` and the fields under "With Consent"; a bio with Consent is the text under the front matter. Every value in the file is one the Maintainer gave.

When the person takes a place before the last in their role group, raise the `order` of each Member after them, so no two share a number. A gap in the numbers is fine.

When a photo is under "With Consent", follow [`photo.md`](photo.md).

Done when: `npm run validate` passes, the file's fields are exactly `name`, `role`, `order` and those under "With Consent", and the text under the front matter is empty or a bio with Consent.

## 4. Open the pull request

The changed pages, for the checks in `CLAUDE.md`, are `/people/` and `/people/<file-name>/`.

Done when: the pull request is open, its body lists the fields published and says the Maintainer stated Consent for each, and the Maintainer has been told each field dropped.

## An Alumnus the site never listed

The same four steps, with these differences:

- **Step 1**: the former role and the year they left are "Stated"; the current position is a Profile field.
- **Step 2**: ask the former role and the year when not given. The order follows the Alumni rule in the `order` row of `content/SCHEMA.md`, renumbering the other Alumni to match, with nothing to ask.
- **Step 3**: the file also holds `role: Alumnus`, `former_role` and `year`.
- **Step 4**: an Alumnus has no Profile page, so the changed page is `/people/`.
