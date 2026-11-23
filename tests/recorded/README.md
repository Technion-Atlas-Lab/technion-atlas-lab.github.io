# Recorded responses

What Crossref and arXiv answer, kept as files, so the tests of `tools/add-publication.js` never
touch the network. `index.json` maps each address the command may ask for to the answer's status
and file. With `RECORDED_RESPONSES` naming this folder, the command reads only from here, and an
address missing from `index.json` stops it (`lib/sources.js`).

Each file has the shape of a real answer, recorded on 2026-11-23 and cut down to the fields the
services always send. The Publications in them are made up, and their authors are the people of
the test content set (`tests/content/members/`), so a test can say which author is a Member.

To record a new shape: `curl` the address, save the answer here, replace the real paper's details
with made-up ones, and add a line to `index.json`.
