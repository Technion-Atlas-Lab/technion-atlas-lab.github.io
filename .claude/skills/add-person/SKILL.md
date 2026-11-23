---
name: add-person
description: Adds a person to the Lab's site as a file in content/members/, holding only the Profile fields that have Consent. Use when the Maintainer asks to add a Member (a new student, postdoc or staff member), or an Alumnus the site never listed.
---

# Add a person

The fields, their formats and the roles are in the `members/<name>.md` section of `content/SCHEMA.md`.

## 1. Sort what the Maintainer gave

Put every detail in the request under one of three headings:

- **Stated**: the name, and the role when given.
- **With Consent**: each Profile field the Maintainer says the person gave Consent for.
- **Consent unstated**: each Profile field given with no word on Consent.

Every value comes from the Maintainer's words. A detail you could look up yourself (a GitHub page, an ORCID iD) stays out.

Done when: every detail in the request is under one heading.

## 2. Ask the judgement calls, in one round

Ask only what the request left open:

- **Role**, when it was not given.
- **Order**: print the role group as it stands (each name with its `order`), propose the place after the last, and ask whether that is right.
- **Consent**, for each field under "Consent unstated": "Did <name> give Consent to publish <fields>?"

Done when: the role and the order are settled, and every field is under "With Consent" or dropped.

## 3. Write the file

Create `content/members/<file-name>.md`. The file name is the person's name without a title, in lowercase ASCII letters with hyphens: `Dr. Ada Lovelace` becomes `ada-lovelace.md`. It becomes the address of the Profile page, and Publications and News name the person by it, so it stays for good. When that file already exists, ask the Maintainer for another name.

The file holds `name`, `role`, `order` and the fields under "With Consent"; the bio is the text under the front matter. An Alumnus also gets `former_role` and `year`.

When the person takes a place before the last in their role group, raise the `order` of each Member after them, so no two share a number.

**Photo**: the repository is public and its history is permanent, so the photo is committed already stripped of its embedded metadata (camera, author, location). Write it beside the Member's file with:

```bash
node -e "import('sharp').then(({ default: sharp }) => sharp(process.argv[1]).rotate().toFile(process.argv[2]))" <the photo given> content/members/<file-name>.jpg
```

Then print what is left:

```bash
node -e "import('sharp').then(async ({ default: sharp }) => { const m = await sharp(process.argv[1]).metadata(); console.log(['exif', 'icc', 'iptc', 'xmp'].filter((k) => m[k])); })" content/members/<file-name>.jpg
```

Done when: `npm run validate` passes, the file's fields are exactly `name`, `role`, `order` and those under "With Consent", and a photo's check prints `[]`.

## 4. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/people/` and, for a current Member, `/people/<file-name>/`.

Done when: the pull request is open and its body lists the fields published and says the Maintainer stated Consent for each.
