# Content schema

`content/` holds the site's content. The generator (`src/`, `eleventy.config.js`) reads it to
build `_site/`. Nothing in `content/` knows about layouts, URLs or templates.

Every build checks the content against this schema and stops if anything is invalid, naming
each file and field at fault. To check without building:

```
npm run validate
```

`lib/content.js` holds the same rules as code. Change both together.

## Ground rules

1. **Unknown fields are rejected.** Only the fields listed for a type may appear. To add a field,
   change this file and `lib/content.js` together.
2. **Required fields must be present** and non-empty.
3. **Fields hold plain text, not HTML.**
4. **One item, one file.** A type kept in a folder has one Markdown file per item, named in
   lowercase letters, digits and hyphens (`member-name.md`). The file opens with its fields as
   YAML between two `---` lines; a type may use the plain text under them.

## Types

| Type | File |
|---|---|
| Site settings | `site.yaml` |
| Member or Alumnus | `members/<name>.md` |

---

## `site.yaml`: site settings

Plain YAML, one `field: value` per line.

| Field | Required | What it is |
|---|---|---|
| `name` | yes | The Lab's short name, shown as the Home heading: `ATLAS Lab`. |
| `full_name` | yes | The Lab's full name: `ATLAS Research Laboratory — AI Trust, Learning, Architecture, and Security`. |
| `mission` | yes | The Lab's mission, as written. Write it as a YAML block (see the example below) to keep its line breaks. Also Home's description for search engines and link previews, on one line. |
| `mailbox` | yes | The Lab mailbox, an email address. |
| `url` | yes | The site's address: `https://` and the host, with nothing after it. Used for canonical addresses, link previews and the sitemap. Change it at Go-live. |

```yaml
name: ATLAS Lab
full_name: ATLAS Research Laboratory — AI Trust, Learning, Architecture, and Security
mission: |-
  Atlas
  Research Laboratory
  AI Trust, Learning, Architecture, and Security
mailbox: atlaslab.at.technion@gmail.com
url: https://technion-atlas-lab.github.io
```

---

## `members/<name>.md`: a Member or an Alumnus

One file per person. The file name becomes the address of the Member's Profile page:
`members/member-name.md` is shown at `/people/member-name/`. An Alumnus has no Profile page.

Add a field only when the Maintainer states that the person gave Consent for it
(`CODING_STANDARDS.md`). A field that is absent leaves nothing on the page.

| Field | Required | What it is |
|---|---|---|
| `name` | yes | The person's name as shown. A title such as `Prof.` is left out of the initials avatar. |
| `role` | yes | One of `Lab Director`, `Postdoctoral Researcher`, `PhD Student`, `MSc Student`, `Research Staff`, `Alumnus`. The People page groups Members by role, in this order. |
| `order` | yes | A whole number: the person's place within their role group, lowest first. Equal numbers fall back to name order. |
| `photo` | no | The file name of a photo kept beside this file: `member-name.jpg` (`.jpg`, `.jpeg`, `.png` or `.webp`; lowercase letters, digits and hyphens). The build publishes it resized, cropped square and with all embedded metadata removed, never as committed. Without one, the person gets an avatar of their initials. |
| `email` | no | An email address. |
| `phone` | no | A phone number in international form: `+972 4 000 0000`. Personal or office, as the Member chose. |
| `orcid` | no | The ORCID iD alone: `0000-0002-1825-0097`. |
| `research_interests` | no | A YAML list of short phrases. |
| `google_scholar`, `dblp`, `github`, `linkedin`, `website` | no | Links, each a web address starting with `https://`. `website` is the person's own site. |
| `former_role` | Alumnus only, yes | The role held in the Lab: any role above except `Alumnus`. |
| `year` | Alumnus only, yes | The year the person left the Lab: `2024`. |
| `current_position` | Alumnus only, no | Where the person is now: `Research Engineer at Example Corp`. |

The text under the front matter is the **bio**: plain text, with a blank line between paragraphs.

An Alumnus may keep the fields they had as a Member; the Alumni row shows only the photo or
initials avatar, name, former role, year and current position.

```markdown
---
name: Member Name
role: PhD Student
order: 2
photo: member-name.jpg
email: member.name@example.org
research_interests:
  - Agent sandboxing
  - Prompt injection
github: https://github.com/member-name
---
Member Name studies how AI agents fail under attack.

Before joining the Lab, Member built compilers.
```

```markdown
---
name: Alumnus Name
role: Alumnus
order: 1
former_role: MSc Student
year: 2024
current_position: Research Engineer at Example Corp
---
```
