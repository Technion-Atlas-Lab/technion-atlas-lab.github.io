---
name: add-person
description: Adds a person to the Lab's site as a file in content/members/, holding only the Profile fields that have Consent. Use when the Maintainer asks to add a Member (a new student, postdoc or staff member), or an Alumnus the site never listed.
---

# Add a person

The fields, their formats and the roles are in the `members/<name>.md` section of `content/SCHEMA.md`.

## 1. Sort what the Maintainer gave

Put every detail in the request under one of three headings:

- **Stated**: the name, and the role when given; for an Alumnus, also the former role and the year they left.
- **With Consent**: each Profile field the Maintainer says the person gave Consent for.
- **Consent unstated**: each Profile field given with no word on Consent.

The bio, the photo and an Alumnus's current position are Profile fields too. A statement of Consent covers the fields it names; a field given in another sentence is "Consent unstated".

Every value comes from the Maintainer's words: the file holds what they gave, and nothing you found by looking the person up.

Done when: every detail about the person in the request is under one heading.

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Role**, when it was not given; for an Alumnus, the former role and the year they left.
- **Order**: print the role group as it stands (`grep -l '^role: <role>' content/members/*.md | xargs grep -H -E '^(name|order):'`), propose the place after the last (the highest `order` plus one, or 1 in an empty group), and ask whether that is right. For an Alumnus the place follows the rule in step 3 of the `move-to-alumni` skill, with nothing to ask.
- **Consent**, for each field under "Consent unstated", named in plain words: "Did <name> give Consent to publish their GitHub link and bio?"
- **File name**, in two cases: the name is not in Latin letters (ask for its Latin spelling), or the file already exists (ask for another name). The rule for the name is in step 3.

Done when: the role, the order and the file name are settled, and every field is under "With Consent" or dropped. A field whose Consent the Maintainer could not confirm is dropped.

## 3. Write the file

Create `content/members/<file-name>.md`. The file name is the person's name without a title, in lowercase ASCII letters with hyphens: `Dr. Ada Lovelace` becomes `ada-lovelace.md`. It becomes the address of the Profile page, and Publications and News name the person by it, so it stays for good. The `name` field keeps the title.

The file holds `name`, `role`, `order` and the fields under "With Consent"; a bio with Consent is the text under the front matter. An Alumnus also gets `former_role` and `year`.

When the person takes a place before the last in their role group, raise the `order` of each Member after them, so no two share a number. A gap in the numbers is fine.

**Photo**: the repository is public and its history is permanent, so the photo is committed already stripped of its embedded metadata (camera, author, location). Write it beside the Member's file, keeping the extension of the photo given (`.jpg`, `.jpeg`, `.png` or `.webp`), and name it in the `photo` field:

```bash
node -e "import('sharp').then(({ default: sharp }) => sharp(process.argv[1]).rotate().toFile(process.argv[2]))" <the photo given> content/members/<file-name>.jpg
```

Then print what is left:

```bash
node -e "import('sharp').then(async ({ default: sharp }) => { const m = await sharp(process.argv[1]).metadata(); console.log(['exif', 'icc', 'iptc', 'xmp'].filter((k) => m[k])); })" content/members/<file-name>.jpg
```

Done when: `npm run validate` passes, the file's fields are exactly `name`, `role`, `order` and those under "With Consent", the text under the front matter is empty or a bio with Consent, and the check of a photo, when there is one, prints `[]`.

## 4. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/people/` and, for a current Member, `/people/<file-name>/`.

Done when: the pull request is open and its body lists the fields published, saying the Maintainer stated Consent for each, and the Maintainer has been told each field dropped for want of Consent.
