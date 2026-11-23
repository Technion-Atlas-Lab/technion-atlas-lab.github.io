---
name: update-publications
description: Finds Members' new papers in their ORCID records and brings the Publications up to date. Use when the Maintainer asks to update, refresh or sync the Publications or the Research page.
---

# Update the Publications

`npm run update-publications` reads the ORCID record of each current Member with an `orcid`, adds to a listed Publication the DOI or arXiv link it lacks, and reports the rest. It writes no new Publication: each needs a Research Area, which the Maintainer assigns, so you add it with the `add-publication` skill. The README's Commands table says what the command takes; the exclusion list's format is in the `excluded-publications.yaml` section of `content/SCHEMA.md`.

## 1. Run the command

```bash
npm run update-publications
```

When it answers `Cannot update the Publications`, it changed nothing and says what is wrong: fix that, then run it again.

Done when: the report ends with `Already on the site, unchanged:`, and you hold the report for step 2.

## 2. Ask the judgement calls, in one round

Ask about every item of the report's New and Needs review parts, together:

- **New work**: its Research Area, one of the file names in `content/research-areas/`; or, when the Maintainer says it is no paper of the Lab's, whether to put it on the exclusion list.
- **A Member "not among its authors"**: whether the work is theirs. When it is not, whether to put it on the exclusion list, and why.
- **A Preprint whose published version has appeared**: whether to update its card to the published version the report names.
- **Any other item**: what the report line says, and what the Maintainer wants done about it.
- **Placeholder or real**: when `grep -l 'Design-phase placeholder' content/publications/*.md` prints a file, the site is in the Design phase: read `docs/agents/design-phase.md`. A work from an ORCID record is real, so ask whether to add it before Design approval all the same.

The exclusion list takes an entry only on the Maintainer's yes, with the reason they gave.

Done when: every New and Needs review item has the Maintainer's answer.

## 3. Act on the answers

- **New work with a Research Area**: the `add-publication` skill, from its step 3, with the report's command and the area. The report's `Its Preprint:` link is the arXiv link that skill's step 4 adds.
- **Exclusion**: one entry in `content/excluded-publications.yaml` per work, named by the DOI or arXiv link the report gives it (its title when it has neither), with the Maintainer's reason. Replace the file's `[]` with the first entry.
- **Preprint card**: in its file, `status: published`, and the venue, year and DOI the report names. The `arxiv` link stays.
- **Any other item**: what the Maintainer asked.

Run the command again.

Done when: `npm run validate` passes, and the second report lists no New work and no Needs review item the Maintainer answered, except those the Maintainer chose to leave.

## 4. Open the pull request

The changed pages are `/research/` and `/people/<file-name>/` for each current Member who is an author of a changed Publication.

Done when: the pull request is open and its body lists the Publications added (with their Research Areas), updated and excluded (with the reasons), and every Needs review item left open.
