# Adesnik Lab website: factual inventory

- Repo: https://github.com/hadesnik/adesnik-lab-website (public, created 2026-06-17, last push 2026-11-15)
- Inspected commit: `9e225eb` ("Members: add headshot for Lucas Chi (undergraduate)", 2026-11-15), shallow clone, read-only. Nothing was installed or run.
- Live site: https://adesnik.berkeley.edu/ (fetched 2026-11-17). The live HTML, `styles.css` and `main.js` match the repo byte-for-byte, apart from CRLF line endings.
- All paths below are relative to the repo root.

---

## 1. License

| Item | Finding |
|---|---|
| LICENSE / COPYING file | **None.** No license file anywhere in the repo. |
| GitHub-detected license | **None.** The API reports `license: null`, and `GET /repos/.../license` returns 404. |
| `package.json` `license` field | **`"MIT"`**, together with `"private": true` (`package.json` line 5). This field is npm package metadata. It has no copyright holder, no year, and no license text. |
| README / CLAUDE.md | Neither mentions a license. |
| Footer | `© Adesnik Lab, University of California, Berkeley.` (`src/_includes/partials/footer.njk`) |
| Fonts | No font files and no `@font-face`. The site uses system Arial/Helvetica, so there is nothing to license. |
| Images | No license or credit files. Contents: lab headshots, microscopy images, banners, a Descartes engraving, and funder logos (DARPA, NEI, NIH BRAIN, McKnight, Weill Neurohub, Brain Research Foundation are third-party trademarks). One headshot (`src/assets/images/jennifer-brown.jpg`) has embedded IPTC metadata `photoshop:Credit="Photo: Matthew Staley"`. Many images carry Photoshop or gd-jpeg metadata, which suggests they were pulled from the old WordPress site. |
| Colours | The CSS comments name `#003262` "Berkeley Blue" and `#fdb515` "California Gold". These are UC Berkeley brand colours. |
| Dependencies | Lockfile licenses: 124 MIT, 13 ISC, 9 BSD-2, 4 BSD-3, 4 Apache-2.0, 1 BlueOak, 1 Python-2.0. These are build-time only. |

**Status:** there is no LICENSE file and GitHub detects no license. The only license signal is the `"license": "MIT"` metadata field in a `private` `package.json`. The content and images are lab- or third-party-owned, with no stated license.

---

## 2. Stack, dependencies, scripts

- **Eleventy:** `@11ty/eleventy` `^3.0.0` in `package.json`; the lockfile resolves 3.1.6. The config is CommonJS (`module.exports`) in `.eleventy.js`.
- **Dependencies** (`package.json`), all devDependencies:
  - `@11ty/eleventy` ^3.0.0
  - `puppeteer-core` ^25.1.0. This is only used by the dev scripts `scripts/shot.js` and `scripts/crop.js`, which hard-code the macOS Chrome path `/Applications/Google Chrome.app/...`.
- **npm scripts:**
  - `start`: `eleventy --serve`
  - `build`: `eleventy`
  - `clean`: `rm -rf _site`
- **Node:**
  - The README says "Node 18+".
  - CI uses `node-version: 20` (`.github/workflows/deploy.yml`).
  - Nothing pins the version: no `engines` field, no `.nvmrc` or `.node-version`.
- **Client-side JS libraries:** none. There is one hand-written vanilla file, `src/assets/js/main.js` (527 lines, about 28 KB, loaded with `defer`). Its modules, as IIFEs:
  1. Mobile nav toggle. Toggles `.is-open` and `aria-expanded`, and closes on link click.
  2. Publications filter. A text input filters `li.pub[data-search]`, hides empty sections, and updates an `aria-live` count.
  3. Autoplay videos (`video[data-autoplay]`). Uses IntersectionObserver to play only while on screen.
  4. Parallax on `[data-parallax]` page-hero backgrounds. Uses rAF and is off below 761px and under reduced motion.
  5. Reveal-on-scroll for `[data-reveal]`. Uses IntersectionObserver with a 70ms stagger, capped at 420ms.
  6. External links get `target="_blank" rel="noopener noreferrer"` automatically.
  7. Sticky header gets `.is-scrolled` after 8px of scroll.
  8. **Hero "calcium-imaging neuron field"** (about 330 lines):
     - Builds a procedurally generated SVG with a seeded PRNG (mulberry32). It contains 75 focal neurons (pyramidal or interneuron, with recursive dendrites, axons and boutons) plus two blurred depth-of-field layers.
     - A real-time engine simulates spikes with a GCaMP-like difference-of-exponentials transient, back-propagating dendrite waves, axon pulses, and occasional field-wide waves.
     - Hovering or tapping a cell fires it; holding for more than 2 seconds launches a wave.
     - The cursor is a custom gold "reticle", an inline SVG data URI.
     - The engine pauses offscreen and renders a static frame under `prefers-reduced-motion`.
- **Other files:**
  - `scripts/check_site.py`: uptime monitor, Python standard library only (see §5).
  - `scripts/shot.js`: Puppeteer screenshots at 1366×900 desktop and 390×844 mobile. It also captures the open menu and reports horizontal overflow. Output goes to `previews/`, which is git-ignored.
  - `scripts/crop.js`: crops images using Chrome.

---

## 3. Directory structure and content model

```
.eleventy.js              input src/ -> output _site/; passthrough src/assets -> /assets
.github/workflows/        deploy.yml, site-monitor.yml
scripts/                  check_site.py, shot.js, crop.js
src/
  _data/                  alumni, funding, media, members, movies, publications, research, site, tools (.json)
  _includes/layouts/      base.njk (HTML shell), page.njk (interior page hero + content)
  _includes/partials/     header.njk, footer.njk
  _includes/components/   cards.njk (macros: initials, memberCard, alumnusCard, pubDetail, pubItem)
  assets/css/styles.css   single stylesheet (1,554 lines)
  assets/js/main.js
  assets/images/          ~60 JPG headshots/banners + funders/ logos (6.0 MB)
  assets/videos/          8 MP4 + poster JPGs (29 MB, committed to git)
  index.njk, research.njk, research-theme.njk, members.njk, alumni.njk, publications.njk,
  positions.njk, funding.njk, contact.njk, media.njk, movies.njk, tools.njk
```

All content is **JSON** in `src/_data/`. Templates are Nunjucks (`.njk`). There is no Markdown content and no YAML.

**Pages and URLs:**

| URL | Template |
|---|---|
| `/` | `index.njk` |
| `/research/` | `research.njk` |
| `/research/<slug>/` | `research-theme.njk` (paginated over `research.themes`) |
| `/lab-members/` | `members.njk` |
| `/alumni/` | `alumni.njk` |
| `/publications/` | `publications.njk` |
| `/positions/` | `positions.njk` |
| `/funding/` | `funding.njk` |
| `/contact/` | `contact.njk` |
| `/media/` | `media.njk` |
| `/movies/` | `movies.njk` |
| `/tools/` | `tools.njk` |

Interior pages take these front-matter fields, which `layouts/page.njk` uses: `title`, `eyebrow`, `intro`, `heroImage`.

**Data files and fields:**

- **`site.json`**:
  - Top-level fields: `title`, `shortName`, `institution`, `tagline`, `description`, `url`, `logo`, `social` (empty)
  - `nav[]`: `{label, url}`
  - `contact`: `{address1, address2, city, state, zip, phone, email, applicationsEmail}`
  - `affiliations[]`: `{name, url}`
- **`members.json`**: `groups[]` of `{id, title, people[]}`.
  - Person fields: `name`, `role`, optional `note` (e.g. "Joint with the Ji Lab"), `photo` (path or `null`), `bio` (string or `null`), `links` (object of `label: href`).
  - Groups: `pi`, `postdocs`, `phd`, `medical-scientists`, `undergraduates`. A group with `id == "pi"` gets a wide horizontal "lead" card.
  - **Initials-avatar fallback** (`src/_includes/components/cards.njk`, macro `initials`): when `photo` is falsy, the name is split on spaces and the first letters of the first and last words are taken, upper-cased. A single word gives one letter. It renders as `<span class="person__avatar" aria-hidden="true">SA</span>`: gold letters on a navy gradient square. Two undergraduates currently use it.
- **`alumni.json`**:
  - `note`
  - `people[]`: `{name, current, url?, photo?}`
  - Rendered as a compact row: a 52px circular avatar (photo, or initials as fallback) plus the name, linked if `url` is set, and the current position.
- **`publications.json`**:
  - `note`
  - `preprints[]` and `published[]`, newest first
  - Fields: `title`, `authors` (one string), `journal`, `year` (number), `volume?`, `doi?`, `pmid?`, `pdf?` (direct publisher PDF URL; 26 of 44 published papers have one)
  - Current counts: 5 preprints and 44 published.
  - Filter `pubLink` (`.eleventy.js`) resolves the link: `https://doi.org/<doi>`, otherwise PubMed, otherwise `url`.
  - The publications page splits papers into rolling buckets based on build year:
    - "Recent papers": the last 4 years
    - "Preprints": the last 3 years
    - "Papers": 2013 up to the recent cutoff
    - "Papers from before the Adesnik lab": before 2013
  - The buckets use the `buildYear` global plus the `sinceYear` and `beforeYear` filters.
- **`research.json`**:
  - `intro`
  - `themes[]`: `{title, slug, summary, image, imageAlt, papers[]}`
  - `papers[]` entries: `{title, summary}`
  - The `pubByTitle` filter (`.eleventy.js`) looks up the full record in `publications.json` by normalised title and **throws, failing the build,** if there is no match.
  - `imageAlt` is defined but **not used** by any template, because theme images render as CSS `background-image`.
  - There are currently 3 themes with 5 papers each.
- **`media.json`** (press coverage; there is no separate "news" collection):
  - `intro`
  - `items[]`: `{title, outlet, author, date (ISO), url, summary, type?, paper?}`
  - `paper` is a title that resolves through `pubByTitle`. Dates render through the `readableDate` filter.
- **`movies.json`**: `items[]` of `{src, poster, title, caption, autoplay}`. These are self-hosted MP4s, rendered as muted, looped, `playsinline` video with controls.
- **`funding.json`**: `intro`, `sources[]` of `{name, url, logo?}`. Shows the logo, or the name as text if there is no logo.
- **`tools.json`**: `intro`, `items[]` of `{title, summary, url, linkLabel, tag}`.

**Automated publication fetching:** none. There is no script, workflow or API call. The publications `note` says "DOIs/PMIDs verified against CrossRef and PubMed" during a one-time migration from the old WordPress site.

**Not present:** blog or news collection, RSS, sitemap, robots.txt, custom 404 page, `og:image`, favicon.ico (the favicon is the logo PNG).

---

## 4. Design system (`src/assets/css/styles.css`)

**CSS approach:** one hand-written, plain CSS file. There is no Sass, Tailwind, PostCSS or build step.
- The file uses CSS custom properties, `clamp()` fluid sizing, CSS grid and flexbox, and `min()`.
- Class names follow a BEM-like scheme (`.person__media`, `.btn--gold`).
- Behaviour hooks use data attributes (`data-reveal`, `data-parallax`, `data-nav-toggle`).

**Fonts:**
- `--font-display` and `--font-body` are both `Arial, Helvetica, sans-serif`.
- System fonts only: no Google Fonts, no self-hosted files.
- The header comment says "a single clean sans typeface (Inter)", but the variables were set to Arial, so the comment is stale.
- The serif "Adesnik Lab" wordmark is part of the raster logo PNG (`src/assets/images/adesnik-lab-logo.png`, 433×88). The logo is a gold serif wordmark beside a navy, teal and gold brain-outline swoosh.

**Palette (`:root`):**

| Variable | Value | Note |
|---|---|---|
| `--navy-900` | `#001b33` | darkest ground (navy sections, footer) |
| `--navy-800` | `#002a4e` | also `theme-color` |
| `--navy` | `#003262` | "Berkeley Blue"; link colour |
| `--gold` | `#e0a93b` | accent, "refined from the lab logo" |
| `--gold-bright` | `#fdb515` | "California Gold"; hover and focus |
| `--paper` | `#ffffff` | |
| `--paper-2` | `#f7f5f0` | warm off-white band |
| `--ink` | `#16202e` | body text |
| `--muted` | `#586472` | secondary text |
| `--line` / `--line-light` | `rgba(16,32,48,.12)` / `rgba(255,255,255,.16)` | hairlines |

Other tokens: `--wrap: 1160px`, `--gap: clamp(1rem,3vw,2rem)`, `--section-y: clamp(3.5rem,8vw,7rem)`, `--radius: 14px`, a soft navy drop shadow `--shadow` and a stronger hover shadow `--shadow-lift`, and `--ease-out: cubic-bezier(.2,.6,.2,1)`.

**Typography:**
- Body text is fluid, `clamp(1rem, .96rem + .2vw, 1.075rem)`, with line-height 1.65.
- Headings are bold, with tight leading (1.08) and `-0.02em` tracking, in `navy-900`.
- The hero H1 runs up to 5rem at weight 500. Gold `<em>` words are used for emphasis.
- "Eyebrow" labels are small uppercase gold text with `.16em` tracking.
- Section H2s get a 56×3px gold underline bar, which "draws in" with the reveal animation.

**Layout:**
- Centred `.wrap` container: `min(100% - 2.5rem, 1160px)`.
- Sections alternate between white, warm off-white (`.section--paper`) and dark navy (`.section--navy`).
- Text-width helpers: `.measure` (65ch) and `.measure-wide` (62rem).
- Grids:
  - `.grid--3` for the 3 research cards
  - `.people-grid` with `auto-fill, minmax(190px,1fr)`
  - `.alum-grid` with `minmax(290px,1fr)`
  - `.funders` with `minmax(240px,1fr)`
  - `.movie-grid` with 2 columns
  - `.feature` split rows, 1fr / 1fr, alternating sides

**Breakpoints (max-width):**

| Width | What changes |
|---|---|
| 960px | nav collapses into a hamburger |
| 860px | 3-column grids and the footer grid go to 1 column; the CTA band stacks |
| 760px | features, contact, movies and the intro split go to 1 column; the PI card stacks; parallax switches off below 761px |
| 640px | publication-detail rows stack |
| 560px | the people grid is forced to 2 compact columns |

**Components:**
- **Header.** Sticky and translucent white (`rgba(255,255,255,.9)` with `backdrop-filter: blur(10px)`) with a hairline bottom border. The logo sits on the left and text nav links on the right. The active page link (`aria-current="page"`) and hovered links get a 2px gold underline. After scrolling, the header shrinks from 72px to 60px and gains a shadow.
- **Mobile menu.** A 44×44 bordered button whose three bars animate into an X. The menu drops down as a full-width white panel with stacked, divided links.
- **Home hero.** Full-bleed deep navy gradient with a warm gold radial glow at the top right and a dark left-side scrim behind the text. The animated SVG neuron network (gold somas, faint cream dendrites, gold axons with travelling white sparks) fills the background. The foreground holds an eyebrow, a large headline, a subtitle, and two pill buttons: solid gold, and a white-outline "ghost" button.
- **Interior page hero** (`layouts/page.njk`). Navy gradient with a gold dot-grid overlay (radial-gradient dots on a 26px grid at 18% opacity). It can carry an optional photo banner, which is parallax-scrolled under a dark gradient. It contains an eyebrow, H1 and intro.
- **Research theme cards.** White cards with 14px corners, a hairline border and a soft shadow. Each has a 16:10 image (the microscopy photo is a background, with a gold dot-grid overlay) above a title and summary. On hover the card lifts 4px and the image zooms 4.5%.
- **Research feature rows.** Two-column rows that alternate sides: a 4:3 rounded image beside a title, summary and a "Selected papers in this area →" link with a gold underline.
- **Research-theme detail page.** Breadcrumb, then a numbered list ("01", "02"... in large gold numerals). Each entry has title, authors, journal and year, a plain-language summary, and uppercase small links: "Read the paper", "PDF", "PubMed".
- **People grid.**
  - Square photo cards: the image fills the top, and the name, role and optional note/bio/links sit below.
  - On hover the card lifts and the photo zooms 6%.
  - The PI card is horizontal, with a 190px photo beside the text.
  - Group headings have a gold bottom rule.
- **Alumni.** Bordered rows with a 52px circular avatar. On hover the avatar gets a gold ring.
- **Publication list.** Rows separated by top hairlines, with a 5.5rem year column in gold on the left. The title is semibold, the authors muted, and the journal in **bold italic**. Small uppercase DOI/PubMed/PDF links follow. Above the list sits a pill-shaped search box with a live count ("12 of 49 publications").
- **CTA band.** A gold gradient bar (`--gold` to `--gold-bright`) with a navy headline ("Interested in joining the lab?") and a navy pill button.
- **Footer.** Dark navy, in 3 columns: lab name and affiliations; contact address, phone and email; and an "Explore" nav (all nav links plus Alumni). Column headings are small uppercase gold labels. A hairline separates the copyright line.
- **Other components:**
  - `.apply-card` (Positions), an off-white box
  - `.opening` and `.tool` cards with a 4px gold left border
  - `.tool__tag` pill badges
  - `.press` items (outlet in uppercase, date, title, byline, summary, "The paper:" citation)
  - funder logo tiles
  - the contact "map" tile: a navy panel with a dot grid and a gold CSS map pin, linking to Google Maps (a link, not an embed)
  - movie cards with a black video frame

**Animations:**
- Reveal-on-scroll: fade in and rise 18px over 0.6s, staggered. It only applies when the `html.js` class is present and motion is allowed.
- Card lift and image-zoom hovers. Buttons rise 2px on hover.
- Sticky-header shrink. Parallax hero photos.
- The interactive neuron simulation in the home hero.
- `prefers-reduced-motion: reduce` turns off all transitions and animations and smooth scrolling. The JS separately turns off parallax, reveal and the neuron engine. `html { scroll-behavior: smooth }` applies otherwise.

**Visual feel:** a clean, confident academic site in UC Berkeley colours.
- The page opens on a dark navy band with a glowing gold neuron network that flickers and sends sparks along axons, like a stylised calcium-imaging movie. A large white headline sits over it, with one word in gold.
- Below, the page alternates white, warm cream and deep navy bands. Generous whitespace separates large, tightly tracked sans-serif headings, each underlined with a short gold bar.
- Cards have rounded corners, soft navy-tinted shadows and full-bleed green or false-colour microscopy images. They lift slightly on hover.
- Gold is the only accent. It appears on small uppercase labels, underlines, year numerals, pill buttons and a gold call-to-action band before the navy footer.
- Interior pages open with a shorter navy banner, either a faint gold dot grid or a darkened microscopy photo that scrolls more slowly than the page.
- Overall it reads as modern, restrained and "premium" rather than playful. The only decoration is the dot grid and the neuron motif.

---

## 5. Deploy and monitoring

**`.github/workflows/deploy.yml`:**
- Triggers on push to `main` and on `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`, with no cancel-in-progress.
- Build job steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 20, npm cache)
  3. `npm ci`
  4. `npm run build`
  5. `touch _site/.nojekyll`
  6. `echo "adesnik.berkeley.edu" > _site/CNAME`. The CNAME is written at build time, not committed.
  7. `actions/upload-pages-artifact@v3`
- The deploy job runs `actions/deploy-pages@v4` in environment `github-pages`.

**Pages config** (from the GitHub API):
- `build_type: workflow`, `cname: adesnik.berkeley.edu`
- `protected_domain_state: verified`
- `https_enforced: true`, certificate `approved`, expires 2026-12-20
- `custom_404: false`

**Live site:**
- DNS: `adesnik.berkeley.edu` is a CNAME to `hadesnik.github.io`. The response header is `Server: GitHub.com` (Fastly/Varnish), with `Cache-Control: max-age=600`.
- HTTP redirects to HTTPS with a 301.
- Missing URLs return GitHub's default 404. I saw occasional transient GitHub 503 "Unicorn" responses on missing paths.
- GitHub Pages cannot set custom headers, so there is no CSP, HSTS or similar.

**Daily uptime monitor** (`.github/workflows/site-monitor.yml` and `scripts/check_site.py`, about 800 lines):
- **Schedule:** cron `17 15 * * *` (15:17 UTC). It is deliberately off the hour because GitHub delays top-of-hour cron jobs. It also runs on `workflow_dispatch`, which has a boolean input `test_email`.
- **Permissions:**
  - `contents: read`
  - `pages: read`, to read the custom-domain setting for the diagnosis
  - `actions: write`, to read deploy runs and re-enable the workflow
- **What the script checks** (Python 3.9+, standard library only):
  1. A DNS lookup. It checks that the name points at `hadesnik.github.io` or GitHub's 4 Pages IPs, and flags Pantheon's `23.185.0.x` range as "DNS reverted to the old host".
  2. The TLS certificate. A failure is raised if it expires within 10 days.
  3. An HTTP GET of `/`, `/research/`, `/lab-members/`, `/publications/` and `/contact/`. Each page must return 200, have "Adesnik Lab" in its `<title>`, and **not** contain `wp-content`, which would mean the old WordPress site.
  4. The stylesheet `/assets/css/styles.css`.
  - Pages slower than 10 seconds are noted.
- **Retries and evidence:** it retries 3 times, 60 seconds apart. On failure it gathers evidence from the GitHub API (Pages config, latest deploy run), from `githubstatus.com`, and from the `hadesnik.github.io/adesnik-lab-website/` project URL.
- **The email:** it builds a plain-English diagnosis covering DNS broken or reverted, certificate mismatch or expiry, the domain removed from Pages settings, a broken deploy, a missing stylesheet, or a GitHub incident. Each diagnosis comes with numbered fix steps. The email ends with "Open this repo in Claude Code and paste in this email".
- **Delivery:** the report also goes to `$GITHUB_STEP_SUMMARY`. The exit code is 1 when the site is down, so the run shows red.
- **What it needs:**

  | Secret / variable | Required? | Default |
  |---|---|---|
  | Secret `SMTP_USERNAME` | required | (a Gmail address) |
  | Secret `SMTP_PASSWORD` | required | (a Gmail app password; needs 2-Step Verification) |
  | Secret `SMTP_HOST` | optional | `smtp.gmail.com` |
  | Secret `SMTP_PORT` | optional | `465` implicit TLS; `587` uses STARTTLS |
  | Repo **variable** `ALERT_TO` | optional | `hadesnik@berkeley.edu` |
  | `GITHUB_TOKEN` | automatic | |

  - The email service is any SMTP server; Gmail is the documented choice. The subject is "Adesnik web site outage".
  - The script also has `--dry-run` and `--test-email` flags.
- **Keepalive:** a final step runs `gh api -X PUT repos/<repo>/actions/workflows/site-monitor.yml/enable`. It runs on scheduled runs, with continue-on-error. It resets GitHub's rule that disables scheduled workflows after 60 days without commits.
- **Hard-coded values in the script:** `SITE_HOST`, `REPO`, `GITHUB_PAGES_HOST`, the `PAGES` list, `EXPECTED_IN_TITLE`, and the alert subject and recipient.

---

## 6. Third-party requests on the live homepage

**None.** Every subresource on the homepage, and on all 11 other fetched pages, is same-origin:
- `/assets/css/styles.css`
- `/assets/js/main.js`
- `/assets/images/*.jpg|png`, including CSS `background-image` URLs
- `/assets/videos/*` (Movies page)

The details:
- No `@import`, `@font-face` or external `url()` in the CSS.
- No external URLs in the JS. The reticle cursor is a `data:` URI.
- No analytics, no tag manager, no Google Fonts, no CDN, no iframes or embeds.
- Google Maps on `/contact/` and all journal, PubMed and DOI references are plain outbound `<a>` links, not loaded resources.
- The Tools page links to a `claude.ai/code/artifact/...` URL; this is also a plain link.

---

## 7. Accessibility posture (from HTML and CSS)

**Present:**
- `<html lang="en">`.
- A skip link `<a class="skip-link" href="#main">Skip to main content</a>`, first in `<body>`, off-screen until focused (gold background). `<main id="main">` exists.
- Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main>`, `<footer>`, plus `<nav aria-label="Footer">`. The current page is marked with `aria-current="page"`.
- One `<h1>` per page. Sections use h2 and cards use h3. Footer column headings are `h2.site-footer__heading`.
- Mobile toggle: a `<button>` with `aria-expanded`, `aria-controls="primary-nav"` and a visually-hidden "Menu" label. There is no Escape-key close and no focus management.
- Alt text:
  - logo `alt="Adesnik Lab"`, inside a link with `aria-label="Adesnik Lab — home"`
  - member photos `alt="Portrait of {name}"`
  - initials avatars `aria-hidden`
  - alumni photos `alt=""` inside an `aria-hidden` span, with the name given as text
  - funder logos `alt="{name}"`, plus an `aria-label` on the link
  - Descartes figure: descriptive alt plus a `<figcaption>`
  - hero SVG `aria-hidden="true" focusable="false"`
- Research images are CSS backgrounds, so there is no alt. Their links carry `aria-label` (feature rows) or text (cards). `imageAlt` in `research.json` is unused.
- The publication filter has a visually-hidden `<label>`, and its result count is `aria-live="polite"`.
- `:focus-visible { outline: 3px solid #fdb515; outline-offset: 2px }`.
- `[hidden] { display:none !important }`.
- Reduced motion is fully respected in both CSS and JS.
- Reveal-on-scroll hides content only when JS is running (the `html.js` class is set inline in `<head>`).
- Videos are `muted` with `controls` and `playsinline`. There are no captions or `<track>`; the clips are silent microscopy.
- JS adds `target="_blank"` to all external links, with no "opens in new tab" indication.

**Contrast** (WCAG ratios computed from the palette):

| Pair | Ratio | Result |
|---|---|---|
| ink `#16202e` on white | 16.4 | passes |
| `--muted` `#586472` on white / on `#f7f5f0` | 6.0 / 5.5 | pass AA |
| navy links on white | 12.9 | passes |
| gold `#e0a93b` on navy-900 | 8.2 | passes |
| navy text on gold buttons | 8.2 | passes |
| footer text on navy | 5.7 to 11 | passes |

**Concerns:**
- **Gold `#e0a93b` text on light backgrounds is 2.1:1 on white and 1.95:1 on `#f7f5f0`.** This hits:
  - the "Research" eyebrow on the home cream band (0.8rem uppercase)
  - the `.pub__year` numerals on `/publications/` (white background, 1.3rem regular weight)
  - the `.pub-detail__num` numerals (`aria-hidden`, so decorative)
- **The hover colour `--gold-bright` `#fdb515` on white is 1.78:1.** It is used for link hover on light backgrounds.
- **The focus ring `#fdb515` on white is 1.78:1**, below 3:1 for non-text contrast. On navy it is 9.8:1.
- The hero subtitle `#c2d0de` on the dark hero is about 12:1, but it sits over the animated neuron field. A left scrim mitigates this.

---

## 8. Agent support

- **`CLAUDE.md`** is a pre-build project brief. It covers:
  - the goal: move off the agency-built (Pendari) WordPress site to a fast, hand-coded static site the lab maintains through code with an edit, commit, push, auto-deploy loop and no CMS
  - a *proposed* stack ("plain HTML/CSS/JS ... OR Astro or Eleventy — confirm with owner")
  - the page list
  - "content migration FIRST" from the live WordPress site, with "do NOT invent research descriptions, member bios, or publications"
  - the hosting constraint: berkeley.edu DNS is run by campus IT; the plan is GitHub Pages plus a CNAME request to MCB/HWNI IT; Pantheon cannot host static sites
  - a suggested repo layout (`/data/*.json`, `/css`, `/js`), which differs from the actual `src/_data` layout
  - conventions: accessible semantic HTML, alt text, heading order, contrast, mobile-responsive, minimal dependencies
  - "First steps" and "Open questions"

  It has **not** been updated since the build. It still describes the stack as undecided, and it does not mention the monitor, the data model or the commands.
- **`AGENTS.md`:** none.
- **`.claude/`:** none. No skills, commands, settings or hooks.
- **Other agent hooks:** the outage email tells the reader to "Open this repo in Claude Code and paste in this email". The Tools page links to a Claude artifact.
- **README "to change X, edit Y" table:**

  | To change | Edit |
  |---|---|
  | Lab members | `src/_data/members.json` |
  | Alumni | `src/_data/alumni.json` |
  | Publications | `src/_data/publications.json` |
  | Media / press coverage | `src/_data/media.json` |
  | Funding sources | `src/_data/funding.json` |
  | Research themes | `src/_data/research.json` |
  | Nav, contact info, etc. | `src/_data/site.json` |

  The table leaves out `movies.json` and `tools.json`, which exist.

  The README also covers:
  - adding a person: a square headshot of about 600×600 in `src/assets/images/`; `"photo": null` gives an initials avatar
  - adding a publication: newest first, with `doi` and/or `pmid`
  - local run on Node 18+, with a note about a conda Node env on Hillel's macOS 12 Mac
  - the deploy setting: Settings → Pages → Source: GitHub Actions
  - custom-domain steps
  - uptime monitor setup: a Gmail app password and `gh secret set` commands
  - a project-structure tree
