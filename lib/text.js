// Text from outside the site (Crossref, arXiv, a BibTeX entry) as the content
// set holds it: plain text on one line, with no markup and no escapes.
// lib/sources.js and lib/bibtex.js use it.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// Markup and character escapes out, runs of white space down to one space.
export const plainText = (text) => text
  .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (_, decimal, hex, name) => (
    name ? ENTITIES[name.toLowerCase()] : String.fromCodePoint(decimal ? Number(decimal) : parseInt(hex, 16))))
  .replace(/<\/?[a-zA-Z][^>]*>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Text as a key for comparing two spellings of one name or title: accents,
// case and punctuation do not count.
export const comparable = (text) => text
  .normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();
