// Text from outside the site (Crossref, arXiv, a BibTeX entry) as the content
// set holds it: plain text on one line. lib/sources.js, lib/bibtex.js and
// lib/publications.js use it.

// Runs of white space down to one space.
export const oneLine = (text) => text.replace(/\s+/g, ' ').trim();

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// The character a numbered escape names; the escape as written when there is
// no such character.
const numbered = (escape, code) => code <= 0x10FFFF ? String.fromCodePoint(code) : escape;

// The markup publishers put in a title at Crossref: face markup, and JATS and
// MathML tags. Any other < or > is the title's own and stays.
const MARKUP = /<\/?(?:i|b|em|strong|sub|sup|scp|tt|span|(?:jats|mml):[\w-]+)(?:\s[^>]*)?>/gi;

// A Crossref or arXiv value as plain text: markup out, character escapes read.
export const plainText = (text) => oneLine(text
  .replace(MARKUP, '')
  .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (escape, decimal, hex, name) => (
    name ? ENTITIES[name.toLowerCase()] : numbered(escape, decimal ? Number(decimal) : parseInt(hex, 16)))));

// Text as a key for comparing two spellings of one name or title: accents,
// case and punctuation do not count.
export const comparable = (text) => text
  .normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();
