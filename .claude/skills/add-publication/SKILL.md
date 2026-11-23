---
name: add-publication
description: Adds a Publication to the Lab's site as a file in content/publications/, from a DOI, an arXiv link or a BibTeX entry. Use when the Maintainer asks to add or list a paper or a Preprint.
---

# Add a Publication

`npm run add-publication` reads the citation and writes the file; you never type a citation by hand. The README's Commands table says what the command takes; the fields are in the `publications/<name>.md` section of `content/SCHEMA.md`.

## 1. Settle the source

The command takes one source. A BibTeX entry the Maintainer pasted is saved as `.builds/add-publication/entry.bib`, and that path is the source.

Given several, take the first of these that the request holds: the DOI of the published paper, the BibTeX entry, the arXiv link. Keep an arXiv link you passed over, for step 4. A paper given only by title or by a publisher's page has no source yet: ask for one of the three.

Done when: you hold exactly one DOI, arXiv link or `.bib` path.

## 2. Ask the judgement calls, in one round

- **Research Area**: the Maintainer assigns it, always. Run the command with the source and no `--area`: it lists the Research Areas. Show the list and ask which one. An area named in the request is the answer already.
- **Design phase**: `docs/agents/design-phase.md`, with `publications` as the folder.

Done when: the Research Area is one of the file names the command listed, and the Design-phase question, when it applies, is answered.

## 3. Run the command

```bash
npm run add-publication -- <source> --area <research-area>
```

When it answers `Cannot add the Publication`, it wrote nothing and says what to do: do that, then run it again. When the reason is that the Lab already lists the Publication, the skill ends: tell the Maintainer which file lists it.

Done when: the command prints `Wrote content/publications/<file-name>.md`.

## 4. Finish the file

Read the file and the command's report, then:

- **Every `CHECK:` line settled**, as the line says. An author who "may be" a Member is the Maintainer's to confirm: ask, and on a yes replace the name with `member: <file name>`.
- **The Maintainer's own additions**, each only when the request gave it: the `arxiv` link passed over in step 1, `pdf`, `code` and `video` links, `featured: true`, a figure beside the file with its `figure_alt`, and the summary, in the Maintainer's words, as plain text under the front matter.

Beyond those two, the file stays as the command wrote it. Tell the Maintainer the title, venue, year and status as written, so they can correct what the source got wrong.

Done when: `npm run validate` passes, every `CHECK:` line is settled, and the file differs from what the command wrote only by a settled `CHECK:` line, an addition the Maintainer gave, or the placeholder comment.

## 5. Finish

Follow "Branches" and "Before you finish any change" in `CLAUDE.md`. The changed pages are `/research/` and `/people/<file-name>/` for each author who is a current Member.

Done when: the pull request is open and its body names the source, the Research Area the Maintainer assigned, and each author written as a Member or an Alumnus.
