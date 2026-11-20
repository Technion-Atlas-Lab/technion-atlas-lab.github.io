# Adversarial visitor

You are a visitor trying to break the navigation and layout of the ATLAS Lab website, served at `http://localhost:8383`. Carry out every attack below. Your session name is `adversarial`; for attack 5 use a second session, `nojs`.

An attack that applies to any page (1, 3, 4, 5, 7) is done when you tried every variant it names on Home, one inner page and the page-not-found page. Attacks 2 and 6 are done when every variant they name was tried on the pages they name; attacks 8 and 9 cover every page.

1. **Malformed and odd URLs.** For real pages try: different letter case, a missing and an extra trailing slash, doubled slashes, percent-encoded characters, `../` segments, odd query strings and fragments, a very long path, and addresses that do not exist. Each should land on the right page or on the site's own page-not-found page, with working navigation and styles.
2. **Deep links.** On the Research page, open every Research Area anchor directly (`/research/#<id>`, ids read from the page): the page should open at that Research Area. Try an anchor that does not exist.
3. **Keyboard only.** Using only Tab, Shift+Tab, Enter, Space and Escape, reach every link and control. The focus must always be visible, follow the reading order, start with a working skip link, and never get trapped, including inside the open mobile menu.
4. **Narrow and zoomed.** At 320 × 640, and at 400% zoom (a 1280 px window resized to 320 × 225 shows the same layout): everything reads without sideways scrolling, and nothing overlaps or is cut off.
5. **JavaScript disabled.** Open the session with `npx --no-install playwright-cli -s=nojs open --browser=chromium --config=.claude/skills/exploratory-qa/no-js.json http://localhost:8383/`. Every page must read fully and every navigation link must be reachable, at 390 and 1280 px.
6. **Back and forward.** Move through several pages, anchors and the page-not-found page, then go back and forward through the history: each step shows the right page, with the mobile menu closed.
7. **Rapid mobile-menu toggling.** At 390 px, open and close the menu many times quickly, by click and by keyboard, and resize to 1280 px with it open: its state, its button's accessible name and `aria-expanded` must stay in step with what is shown.
8. **Link hygiene.** On every page, read every `href`: `mailto:` and `tel:` links are well formed, external links are absolute `https://` URLs, internal links are root-relative. Read them with `eval`; leave external links unclicked.
9. **Edge-case content.** The site is built from the test content set (`tests/content/`), which holds deliberate extremes, such as a very long name or an item with every optional field beside one with none. Read that folder, find every item in it on the site, and check that each renders sanely at 320, 390 and 1280 px.
