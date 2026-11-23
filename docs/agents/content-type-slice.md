# A content type's slice

The places a slice touches when it adds a content type (a new folder of items under `content/`, such as `news/`), in the order to build them. News is a worked example: `gh pr diff 89 --name-only`.

1. **Test content set**: `tests/content/<folder>/`, one file per case the tests need. Each file opens with a comment saying which case it is.
2. **Slice tests**: `tests/<page>.spec.js` for the page, and `tests/profile.spec.js` when Profiles list the items.
3. **Schema and loader**, all in `lib/content.js`:
   - an entry in `SCHEMA` (`dir`, `required`, `optional`, `body`, `bodyRequired`, `acrossFields`);
   - a function in `CHECKS` for each new kind of field, and the kind's name in `TEXT_KINDS` when its value is text;
   - a `load<Type>()` that returns the items in the order the pages show them.
4. **Schema doc**: `content/SCHEMA.md`, a row in the Types table and a section with every field and an example. It changes in the same commit as `SCHEMA`.
5. **Data for the templates**: `src/_data/<type>.js`, which joins the items to the Members.
6. **Templates**: the page in `src/pages/` (its `layout` changes from `layouts/stub.njk` to `layouts/page.njk`); a macro in `src/_includes/partials/` when two pages show the item; a `profile-section` in `src/pages/profile.njk` when Profiles list it.
7. **Styles**: a section in `src/assets/site.css`.
8. **Broken content**: `tests/content-broken/<folder>/` and a test per rule in `tests/validation.spec.js`, where one build serves every test.
9. **Placeholder content**: `content/<folder>/`, each file opening with `# Design-phase placeholder` and naming only placeholder people (`member-name-*`, `alumnus-name-*`; `Student Name One` for someone with no file in `members/`).
10. **Docs**: a row in the README's "To change X, edit file Y" table; `GLOSSARY.md` for each new term.

Done when: `npm run check` passes and each of the ten places is changed or has a reason not to be.

## Already in `lib/`

Reuse these before writing a new one:

| Need | Use |
|---|---|
| Name a Member on a card, linked only when current | `namedPerson` |
| Every Member by file name | `loadMembersBySlug` |
| The items to list on each Profile | `itemsByMember` |
| A written date as a day, or nothing when it is no day | `calendarDay` |
| A field that names a Member's file | `missingPerson`, inside a `CHECKS` function |
| A field that names a Research Area's file | the `research-area` kind |
| A field that lists Members' files, each once | the `members` kind |
| A setting the whole site uses, such as a link | a field of `site` in `SCHEMA`, read in a template as `site.<field>` |
| A picture beside the item, published resized and stripped | `pictureBeside`, and `lib/photos.js` |

## What the existing tests hold fixed

- `tests/content/members/bare-member.md` has a Profile with one heading and no list: relate no item to it.
- No two headings on a Profile read the same: a new Profile section needs a heading the footer and the other sections do not use.
