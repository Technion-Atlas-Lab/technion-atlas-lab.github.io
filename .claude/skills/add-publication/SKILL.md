---
name: add-publication
description: Adds a Publication to the Lab's site as a file in content/publications/, from a DOI, an arXiv link or a BibTeX entry. Use when the Maintainer asks to add or list a paper or a Preprint.
---

# Add a Publication

`npm run add-publication` reads the citation and writes the file; you never type a citation by hand. The fields are in the `publications/<name>.md` section of `content/SCHEMA.md`.

## 1. Settle the source

The command takes one source:

- a **DOI** or a doi.org link, read from Crossref;
- an **arXiv** link or id, read from arXiv;
- a **BibTeX** entry: save the entry the Maintainer pasted as `.builds/add-publication/entry.bib` and give that path.

Given several, take the first of these that the request holds: the DOI of the published paper, the BibTeX entry, the arXiv link. A paper given only by title or by a publisher's page has no source yet: ask for one of the three.

Done when: you hold exactly one DOI, arXiv link or `.bib` path.

## 2. Ask the judgement calls, in one round

- **Research Area**: the Maintainer assigns it, always. Run the command with the source and no `--area`: it writes nothing and lists the Research Areas. Show the list and ask which one. An area named in the request is the answer already.
- **Design phase**: when `grep -l 'Design-phase placeholder' content/publications/*.md` prints a file, the site may hold only placeholder content. Ask whether this Publication is a placeholder, or a real one to add before Design approval all the same.

Done when: the Research Area is one of the file names the command listed, and in the Design phase the Maintainer has said placeholder or real.

## 3. Run the command

```bash
npm run add-publication -- <source> --area <research-area>
```

When it answers `Cannot add the Publication`, it wrote nothing and says what to do: do that, then run it again. "Already has the DOI" and "is already this Publication" end the skill: tell the Maintainer which file lists it.

Done when: the command prints `Wrote content/publications/<file-name>.md`.

## 4. Finish the file

Read the file and the command's report, then:

- **Every `CHECK:` line settled.** An author who "may be" a Member is the Maintainer's to confirm: ask, and on a yes replace the name with `member: <file name>`.
- **The Maintainer's own additions**, each only when the request gave it: `pdf`, `code` and `video` links, `featured: true`, and the summary, in the Maintainer's words, as plain text under the front matter. A figure goes beside the file with its `figure_alt`; write it there stripped of embedded metadata: `node -e "import('sharp').then(({ default: sharp }) => sharp(process.argv[1]).rotate().toFile(process.argv[2]))" <the figure given> content/publications/<file-name>.<extension>`.
- **A placeholder** (step 2) opens with the comment its neighbours open with: `# Design-phase placeholder, not a real Publication. Replace in the Content phase.`

Every other field stays as the source gave it. Tell the Maintainer the title, venue, year and status as written, so they can correct what the source got wrong.

Done when: `npm run validate` passes, the report has no `CHECK:` line left unanswered, and the file holds nothing beyond the source's fields and what the Maintainer gave.

## 5. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/research/` and `/people/<file-name>/` for each author who is a current Member.

Done when: the pull request is open and its body names the source, the Research Area the Maintainer assigned, and each author written as a Member or an Alumnus.
