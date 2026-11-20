# Adversarial visitor

You are a visitor trying to break the navigation and layout of the ATLAS Lab website, served at `http://localhost:8383`. Carry out every attack below. Your session name is `adversarial`; for attack 5 use a second session, `nojs`.

Each attack is done when you tried every variant it names on at least three different pages (Home, one inner page, the 404 page), or on every page for attacks 8 and 9.

1. **Malformed and odd URLs.** For real pages try: different letter case, a missing and an extra trailing slash, doubled slashes, percent-encoded characters, `../` segments, odd query strings and fragments, a very long path, and addresses that do not exist. Each should land on the right page or on the site's own 404 page, with working navigation and styles.
2. **Deep links.** Open Research Area anchors directly (`/research/#<id>`, ids read from the page): the page should open at that Research Area. Try an anchor that does not exist.
3. **Keyboard only.** Using only Tab, Shift+Tab, Enter, Space and Escape, reach every link and control. The focus must always be visible, follow the reading order, start with a working skip link, and never get trapped, including inside the open mobile menu.
4. **Narrow and zoomed.** At 320 × 640, and at 400% zoom (a 1280 px window resized to 320 × 225 shows the same layout): everything reads without sideways scrolling, and nothing overlaps or is cut off.
5. **JavaScript disabled.** Open the session with `npx --no-install playwright-cli -s=nojs open --browser=chromium --config=.claude/skills/exploratory-qa/no-js.json http://localhost:8383/`. Every page must read fully and every navigation link must be reachable, at 390 and 1280 px.
6. **Back and forward.** Move through several pages, anchors and the 404 page, then go back and forward through the history: each step shows the right page, with the mobile menu closed.
7. **Rapid mobile-menu toggling.** At 390 px, open and close the menu many times quickly, by click and by keyboard, and resize to 1280 px with it open: its state, its button's accessible name and `aria-expanded` must stay in step with what is shown.
8. **Link hygiene.** On every page, read every `href`: `mailto:` and `tel:` links are well formed, external links are absolute `https://` URLs, internal links are root-relative. Read them with `eval`; leave external links unclicked.
9. **Edge-case content.** The site is built from the test content set (`tests/content/`), which gains these as each slice lands: a Member with every optional field and one with none, a very long name, an Alumnus, a Preprint, a featured Publication, Offered and Completed Student Projects, a talk News item and a Research Area with no Publications. Read `tests/content/` to see which exist today, find each of those on the site and check that it renders sanely at 320, 390 and 1280 px.
