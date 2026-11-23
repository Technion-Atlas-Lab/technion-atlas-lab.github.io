---
name: add-publication
description: Adds a Publication from a DOI, an arXiv link or a BibTeX entry. Use when the Maintainer asks to add a paper.
---

# Add a Publication

`npm run add-publication` reads the citation and writes the file, so every detail of the citation comes from the source. The README's Commands table says what the command takes; the fields are in the `publications/<name>.md` section of `content/SCHEMA.md`.

## 1. Settle the source

The command takes one source. A BibTeX entry the Maintainer pasted is saved as `.builds/add-publication/entry.bib`, and that path is the source.

Given several, take the first of these that the request holds: the DOI of the published paper, the BibTeX entry, the arXiv link. Keep an arXiv link you passed over, for step 4. A paper given only by title or by a publisher's page has no source yet: ask for one of the three.

Done when: you hold exactly one DOI, arXiv link or `.bib` path.

## 2. Ask the judgement calls, in one round

- **Research Area**: the Maintainer assigns it. Run the command with the source and no `--area`: it lists the Research Areas. Show the list and ask which one. An area named in the request is the answer already.
- **Placeholder or real**: when `grep -l 'Design-phase placeholder' content/publications/*.md` prints a file, the site is in the Design phase: read `docs/agents/design-phase.md` and ask its question.

Done when: the Research Area is one of the file names the command listed, and in the Design phase the Maintainer has said placeholder or real.

## 3. Run the command

```bash
npm run add-publication -- <source> --area <research-area>
```

When it answers `Cannot add the Publication`, it wrote nothing and says what to do: do that, then run it again. When the reason is that the Lab already lists the Publication, the skill ends: tell the Maintainer which file lists it.

Keep the file as written, for step 4 to compare against: `mkdir -p .builds/add-publication && cp content/publications/<file-name>.md .builds/add-publication/as-written.md`.

Done when: the command prints `Wrote content/publications/<file-name>.md`, and its copy is in `.builds/add-publication/`.

## 4. Finish the file

Read the file and the command's report, then:

- **Every `CHECK:` line settled**, as the line says. An author who "may be" a Member is the Maintainer's to confirm: ask, and on a yes replace the name with `member: <file name>`.
- **The Maintainer's own additions**, each only when the request gave it: the `arxiv` link passed over in step 1, `pdf`, `code` and `video` links, `featured: true`, a figure beside the file with its `figure_alt`, and the summary, in the Maintainer's words, as plain text under the front matter.
- **The title, venue, year and status told to the Maintainer** as the file has them, so they can correct what the source got wrong.

Done when: `npm run validate` passes, every `CHECK:` line is settled, the Maintainer has been told the four details, and `diff .builds/add-publication/as-written.md content/publications/<file-name>.md` shows only a settled `CHECK:` line, an addition the Maintainer gave, a correction they asked for, or the placeholder comment.

## 5. Open the pull request

The changed pages are `/research/` and `/people/<file-name>/` for each author who is a current Member.

Done when: the pull request is open and its body names the source, the Research Area the Maintainer assigned, and each author written as a Member or an Alumnus.
