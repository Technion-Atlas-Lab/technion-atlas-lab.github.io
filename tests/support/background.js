// The colour a visitor sees behind an element: its own background, or the
// nearest ancestor's that is not transparent. Used by the slice tests that
// check a banner, a band or a marked section (shell, Home, Research).
export const backgroundBehind = (locator) => locator.evaluate((element) => {
  for (let el = element; el; el = el.parentElement) {
    const colour = getComputedStyle(el).backgroundColor;
    if (colour !== 'rgba(0, 0, 0, 0)' && colour !== 'transparent') return colour;
  }
  return null;
});
