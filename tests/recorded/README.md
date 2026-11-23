# Recorded responses

What ORCID, Crossref and arXiv answer, kept as files, so the tests of `tools/add-publication.js`
and `tools/update-publications.js` never touch the network. `index.json` maps each address a
command may ask for to the answer's status and file. With `RECORDED_RESPONSES` naming this folder,
a command reads only from here, and an address missing from `index.json` stops it
(`lib/sources.js`).

Each file has the shape of a real answer, recorded on 2026-11-23 and cut down to the fields the
services always send. The Publications in them are made up, and their authors are the people of
the test content set (`tests/content/members/`), so a test can say which author is a Member.

The `orcid-*.json` files are the ORCID records of Full Member (`0000-0002-1825-0097`, ORCID's own
test iD) and of a second Member whose iD `tests/update-publications.spec.js` adds. Each work in
them is one case the tests name.

The `.bib` files are made-up BibTeX entries, each opening with a comment saying which case it is.

To record a new shape: `curl` the address, save the answer here, replace the real paper's details
with made-up ones, and add a line to `index.json`.
