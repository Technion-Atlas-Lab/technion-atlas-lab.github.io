# Adding content in the Design phase

During the Design phase the site holds only placeholder content. The phase is on while a file in the item's folder opens with a placeholder comment: `grep -l 'Design-phase placeholder' content/<folder>/*.md` prints one.

Before adding an item to `content/` in the Design phase, ask the Maintainer, in the same round as the skill's other questions, whether the item is a **placeholder** or a **real** item to add before Design approval all the same.

A placeholder:

- opens its front matter with the comment its neighbours open with (`# Design-phase placeholder, not a real Publication. Replace in the Content phase.`, and `not a real talk`, `not real News`, `not a real person` for the other types);
- has made-up details, `https://example.org/` links, and names only placeholder people (`member-name-*`, `alumnus-name-*`), never the PI;
- as a Publication, has no real DOI or arXiv page: give `add-publication` a BibTeX entry with the made-up details.

Done when: the Maintainer has said placeholder or real, and a placeholder meets the three points above.
