// Finds characters escaped twice in a page's HTML source, such as `&amp;amp;`
// or `&amp;#39;`, which a visitor would read as `&amp;` or `&#39;`. It happens
// when a template escapes a value the layout escapes again. Used by the slice
// tests (tests/metadata.spec.js) and the site-wide checks (tests/site-wide/).
const DOUBLE_ESCAPED = /&amp;(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi;

// Each double-escaped character in `html`, with a little of the text around it.
export function doubleEscaped(html) {
  return [...html.matchAll(DOUBLE_ESCAPED)].map((m) => html.slice(Math.max(0, m.index - 40), m.index + m[0].length + 20).trim());
}
