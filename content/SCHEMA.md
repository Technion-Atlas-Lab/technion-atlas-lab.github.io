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
5. **Quote a value that contains a colon and a space**, as many titles do:
   `title: "Agents at Work: A Survey"`. Unquoted, YAML reads the colon as the start of another field.

## Types

| Type | File |
|---|---|
| Site settings | `site.yaml` |
| Member or Alumnus | `members/<name>.md` |
| Research Area | `research-areas/<name>.md` |
| Publication | `publications/<name>.md` |
| News item | `news/<name>.md` |
| Student Project | `student-projects/<name>.md` |

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
| `student_project_course` | yes | A link to the page of the Technion course through which a Student Project is taken, a web address starting with `https://`. The "How to take a project" box on the Projects page leads to it. |

```yaml
name: ATLAS Lab
full_name: ATLAS Research Laboratory — AI Trust, Learning, Architecture, and Security
mission: |-
  Atlas
  Research Laboratory
  AI Trust, Learning, Architecture, and Security
mailbox: atlaslab.at.technion@gmail.com
url: https://technion-atlas-lab.github.io
student_project_course: https://example.org/student-project-course
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

---

## `research-areas/<name>.md`: a Research Area

One file per Research Area. The Research page shows one section per area. The file name is the
address of that section: `research-areas/agent-security.md` is shown at
`/research/#agent-security`. Other pages link to that address, so rename a file only when the
area itself changes. The names `main` and `site-menu` are taken: every page already uses them.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The area's name, shown as its heading. |
| `order` | yes | A whole number: the area's place on the Research page, lowest first. Equal numbers fall back to title order. |

The text under the front matter is the **description**, and is required: two or three sentences
of plain text. An area with no Publications still shows its heading and description.

```markdown
---
title: AI Agent Security
order: 1
---
How AI agents are attacked, and how to contain them. The Lab studies both sides.
```

---

## `publications/<name>.md`: a Publication

One file per Publication. Its card appears on the Research page under its Research Area, newest
first (Publications of one year are in title order), and on the Profile of each author who is a
Member.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The Publication's title. |
| `authors` | yes | A YAML list, in the Publication's own order. A Member or an Alumnus is written as `member:` and their file name in `members/`, without `.md`; the card shows their name as their file has it, linked to the Profile for a Member and unlinked for an Alumnus. Anyone else (a Collaborator) is written as a name. |
| `venue` | yes | Where it appeared: the conference, journal or preprint server. |
| `year` | yes | The year it appeared: `2024`. |
| `research_area` | yes | The file name of exactly one Research Area in `research-areas/`, without `.md`. |
| `status` | yes | `published` or `preprint`. A Preprint's card carries a "Preprint" badge. |
| `doi` | no | The DOI alone: `10.1234/example`. The card's "Paper" link leads to it. |
| `paper` | no | A link to the Publication's own page, for one with no DOI. Not together with `doi`. |
| `pdf` | no | A link to the PDF. |
| `arxiv` | no | A link to the arXiv page. |
| `code` | no | A link to the code. |
| `video` | no | A link to a video. A plain link: the site embeds nothing. |
| `figure` | no | The file name of a figure kept beside this file: `publication-name.png` (`.jpg`, `.jpeg`, `.png` or `.webp`; lowercase letters, digits and hyphens). The build publishes it resized, in its own shape and with all embedded metadata removed, never as committed. |
| `figure_alt` | with `figure`, yes | What the figure shows, for a visitor who cannot see it. |
| `featured` | no | `true` marks a featured Publication, one of the few that Home is to highlight. Nothing shows it until Home's own slice is built. |

Every link is a web address starting with `https://`.

The text under the front matter is the optional **summary**: plain language, plain text, with a
blank line between paragraphs.

Removing a Member's or a Research Area's file while a Publication still names it stops the build,
which names the Publication. To keep a departing Member's Publications, make them an Alumnus.

```markdown
---
title: "Sandbox Escapes in Tool-Using Agents: A Study"
authors:
  - member: member-name
  - member: alumnus-name
  - Collaborator Name
venue: Example Security Symposium
year: 2024
research_area: agent-security
status: published
doi: 10.1234/example
pdf: https://example.org/paper.pdf
code: https://example.org/code
figure: sandbox-escapes.png
figure_alt: Diagram of an agent leaving its sandbox through a tool call.
featured: true
---
We show how an agent that may call tools can leave its sandbox, and how to stop it.
```

---

## `news/<name>.md`: a News item

One file per News item. The News page shows every item, newest first (items of one day are in
title order). An item also appears on the Profile of each related Member.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The item's title, shown as its heading. |
| `date` | yes | The day of the event or announcement, written as year-month-day: `2025-03-14`. Shown as "14 March 2025". |
| `type` | yes | `news` or `talk`. A talk carries a "Talk" badge and a link to its recording. |
| `members` | no | A YAML list of the related Members, each written once, as their file name in `members/`, without `.md`. The item names them in this order, each as their file has it, linked to the Profile for a current Member and unlinked for an Alumnus, and appears on the Profile of each current Member. Leave the field out for an item that involves no one in particular. |
| `recording` | talk only, yes | A link to the talk's recording, a web address starting with `https://`. A plain link: the site embeds nothing. |

The text under the front matter is the **body**, and is required: plain text, with a blank line
between paragraphs.

Removing a Member's file while a News item still names them stops the build, which names the
item. To keep a departing Member's News, make them an Alumnus.

```markdown
---
title: "Invited Talk: Containing Tool-Using Agents"
date: 2025-03-14
type: talk
members:
  - member-name
recording: https://example.org/video/invited-talk
---
Member Name spoke at the Example Symposium about how to contain an agent that may call tools.
```

---

## `student-projects/<name>.md`: a Student Project

One file per Student Project. The Projects page shows the Offered ones first, in title order,
then the Completed ones, newest first (those of one year are in title order). A project also
appears on the Profile of each supervisor who is a current Member.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The project's title, shown as its heading. |
| `status` | yes | `offered` (open for new students to take) or `completed`. |
| `research_area` | yes | The file name of exactly one Research Area in `research-areas/`, without `.md`. |
| `supervisors` | yes | A YAML list of the supervisors, each written once, as their file name in `members/`, without `.md`. The card names them in this order, each as their file has it, linked to the Profile for a current Member and unlinked for an Alumnus. |
| `year` | Completed only, yes | The year the project was completed: `2024`. |
| `students` | no | A YAML list of the names of the students who took the project. Add a name only when the Maintainer states that the student gave Consent for it (`CODING_STANDARDS.md`); without the field, the card names no student. |
| `report`, `code`, `video` | no | Links to the project's report, code and video, each a web address starting with `https://`. Plain links: the site embeds nothing. |

The text under the front matter is the **description**, and is required: plain text, with a
blank line between paragraphs.

Removing a Member's or a Research Area's file while a Student Project still names it stops the
build, which names the project. To keep a departing Member's Student Projects, make them an Alumnus.

```markdown
---
title: "Fuzzing Tool-Using Agents"
status: offered
research_area: agent-security
supervisors:
  - member-name
---
Build a fuzzer that feeds a tool-using agent malformed tool results.
```

```markdown
---
title: "A Red-Team Kit for Prompt Injection"
status: completed
year: 2024
research_area: agent-security
supervisors:
  - member-name
  - alumnus-name
students:
  - Student Name
report: https://example.org/report.pdf
code: https://example.org/code
---
A kit of prompt injection attacks for testing an agent before it ships.
```
