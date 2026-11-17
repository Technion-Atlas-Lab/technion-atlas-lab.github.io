# TDK lab website: factual inventory

Gathered on 2026-11-17. Facts only, no design decisions.

**Sources**
- Repo `TechnionTDK/techniontdk.github.io`, shallow clone of `main` at commit `11c6f30` (2026-11-10, "design: new theme — system type, crimson accent from the logo, banded home page"). The repo has 44 commits and was created 2026-09-09. It is public. The GitHub API returns `license: null`, `description: null` and no topics.
- Live site `https://tdk.cs.technion.ac.il/`. I fetched the homepage, its response headers, `/css/site.css`, `/sitemap.xml` and all 105 sitemap URLs.
- The Technion accessibility statement and privacy policy (EN and HE) that the TDK footer links to.
- File paths below are relative to the repo root unless noted otherwise.

---

## 1. License

- **There is no license.** The repo has no `LICENSE`, `LICENSE.md` or `COPYING` file, and the GitHub API reports `license: null`.
- `package.json` has **no `license` field**. It has `"private": true`.
- `README.md`, `CLAUDE.md` and `docs/deploy.md` never mention a license.
- The only rights statement is the footer text `© Technion Data & Knowledge Lab` (`content/site.yaml` → `footer.copyright`).
- Without a license, default copyright applies. The owner's permission to "use as inspiration" is the only grant we have.
- Commit `5388c8e` (2026-11-08) is titled "images: replace stock area and project images with original SVG drawings (copyright)". The 7 SVGs in `assets/images/areas/*.svg` and `assets/images/projects/the-jewish-bookshelf-project.svg` were drawn to replace stock images, for copyright reasons.
- The npm dependencies (in `package-lock.json`) are mostly MIT, with some ISC and BSD-2-Clause. That is irrelevant unless we copy code.

## 2. Eleventy version, dependencies, scripts, Node

**`package.json`**
- Fields: `"name": "tdk-website"`, `"type": "module"` (ESM config), `"private": true`.
- `devDependencies`: no runtime `dependencies` at all.
  - `@11ty/eleventy ^3.1.6` (lockfile resolves 3.1.6, which declares `engines.node >=18`)
  - `cheerio ^1.0.0` (lock 1.2.0): used by `tools/linkcheck.js` and the scraper
  - `gray-matter ^4.0.3`: used by `tools/validate.js`
  - `js-yaml ^4.1.0` (lock 4.3.2): used by `src/_data/site.js` and the validator
  - `turndown ^7.2.0` (lock 7.2.4): HTML→Markdown, used only by the one-off scraper
- `scripts`:
  - `validate`: `node tools/validate.js`
  - `dev`: `npx @11ty/eleventy --serve`
  - `build`: `npm run validate && npx @11ty/eleventy`. Validation gates the build.
  - `linkcheck`: `node tools/linkcheck.js`

**Node version.** There is no `engines` field, `.nvmrc` or `.node-version`. CI pins Node **22** in `.github/workflows/deploy.yml` (`actions/setup-node@v4` with `node-version: 22`, `cache: npm`).

**Eleventy plugins.** None. No `@11ty/eleventy-img`, no navigation plugin, no RSS plugin. RSS and the sitemap are hand-written Nunjucks templates. `README.md` ("Decisions worth knowing") says why `eleventy-img` is left out: CSS crops the images, and the build stays under a second.

**Config (`eleventy.config.js`)**
- Directories: input `.`, output `_site`, includes `src/_includes`, data `src/_data`.
- Template formats: `njk` and `md`. `markdownTemplateEngine: false`, so content Markdown is never templated. `htmlTemplateEngine: 'njk'`.
- Ignored inputs: `node_modules`, `_site`, `tools/**`, `docs/**`, root `*.md`, `content/SCHEMA.md`.
- Passthrough copies: `assets`, `src/css → css`, `src/js → js`.

## 3. Directory structure and content/data model

**Layout.** The repo is split into two halves.
- **Data:** `content/` + `assets/`. Humans and agents edit this half.
- **Generator:** `src/` + `eleventy.config.js`.
- `content/` contains no Eleventy-specific files: no directory data JSON, no `layout` and no `permalink`.

```
content/   SCHEMA.md, site.yaml, pages/ people/ areas/ publications/ news/ projects/ guides/ courses/
assets/images/{areas,news/<year>,people,projects,site}/
src/_data/site.js            loads content/site.yaml
src/_includes/layouts/       base, page, area, news-item, guide (.njk)
src/_includes/partials/      header, footer, person-card, person-compact, publication, news-teaser, area-card, course-run
src/pages/                   index, people, research, publications, news, projects, guides, courses, 404, sitemap (xml), feed (xml)
src/css/site.css             the only stylesheet
src/js/nav.js                the only script
tools/validate.js            schema validator (452 lines)
tools/linkcheck.js           internal link/anchor/asset checker over _site (100 lines)
tools/scrape/                one-off WordPress→Markdown migration (fetch.js, extract.js, lib.js, README.md)
docs/deploy.md
.github/workflows/deploy.yml
.claude/skills/              3 skills
CLAUDE.md, README.md, MIGRATION_REPORT.md
```

**Routing.** All routing lives in `eleventy.config.js`.
- A `routeFor(inputPath)` function is applied through global `eleventyComputed` (`permalink`, `layout`). Content files therefore cannot set their own layout or URL.
- A `PAGE_ROUTES` map holds the permalinks for `src/pages/*`.
- Data-only types get no page of their own: people, publications, projects and courses (`DATA_ONLY`).
- URL patterns:
  - `content/pages/<slug>.md` → `/<slug>/` (`home.md` → no page; it becomes the homepage intro)
  - `content/areas/<slug>.md` → `/research/<slug>/`
  - `content/news/YYYY-MM-DD-<slug>.md` → `/news/YYYY/<slug>/`
  - `content/guides/<slug>.md` → `/guides/<slug>/`
- There are **no per-person pages**. Every person reference links to `/people/#<slug>`.

**Format.** Every type is **one Markdown file per item, with YAML front matter**. The filename is the slug and the identity. The only exception is site settings: one plain YAML file, `content/site.yaml`.

`content/SCHEMA.md` is the field reference. `tools/validate.js` holds the same schema as code:
- Unknown fields are rejected.
- Cross-reference slugs must resolve.
- Asset paths must start with `/assets/` and exist on disk.
- Dates must be unquoted ISO; HTML is not allowed in fields.
- The news filename date must equal the `date` field.

| Type | Dir | Fields (req = required) | Count in repo |
|---|---|---|---|
| Site settings | `site.yaml` | `name, short_name, url, description, logo, favicon, affiliations[{name,url,logo}], nav[{label,url}], footer{copyright, links[{label,url}]}, home{news_count, photo_news_count}, course_semesters[], courses_intro, projects_intro` | 1 |
| Page | `pages/` | `title` (req). Fixed set: `home`, `about`, `contact` | 3 |
| Person | `people/` | `name` (req), `status` (req: `active`/`alumni`), `group` (req if active: faculty/visiting/postdoc/staff/phd/msc/developer), `honorific` (Prof./Dr.), `role`, `degree` (Ph.D./M.Sc.), `advisors` (slugs), `external_advisors` (strings), `email`, `website`, `links` (keys: scholar, dblp, orcid, github, linkedin, x, youtube, spotify), `phone`, `office`, `interests`, `photo`, `areas` (slugs), `aliases`, `order`. Body = optional bio | 48 (22 active, 26 alumni; 22 with photos) |
| Research area | `areas/` | `title`, `tagline` (req), `image`, `order`, `collaborators[{name, affiliation, url}]`. Body = overview | 7 |
| Publication | `publications/` | `title`, `authors` (list of plain strings), `venue`, `year` (req); `citation`, `status` (published/to-appear/preprint), `links` (keys: paper, arxiv, doi, code, slides, video), `areas`. Body = abstract | 92 |
| News | `news/` | `title`, `date` (req); `summary`, `cover`, `photos[]`, `tags` (closed list: paper, award, grant, event, visit, talk, media, milestone), `people` (slugs), `publications` (slugs). Body = text | 87 (2017-03 to 2026-09) |
| Project | `projects/` | `title`, `advisors` (req); `image`, `status` (open/closed), `audience` (msc/phd/undergrad). Body = description | 2 |
| Guide | `guides/` | `title`, `summary`, `updated` (req); `author` (slug), `order` | 1 (placeholder "Draft — to be written") |
| Course | `courses/` | `title`, `runs` (req; each run: `semester`, `instructors` (slugs) XOR `lecturer` (text), `url`); `number` (8-digit quoted string), `url` | 5 |

**Derived lists.** Collections and filters in `eleventy.config.js` compute these; nothing is stored twice.
- `areas` is declared on people and publications, never on the area. `peopleInArea` and `publicationsInArea` are derived from it.
- Publication author strings are linked to people by exact match on `name` or `aliases` (`personByName`).
- `newsAbout` derives a person's news; `publicationsBySlug` resolves the papers a news item cites.
- People are sorted by group order, then `order`, then name.
- Publications are sorted by year (descending), then title.
- Course runs are split into `courseRunsCurrent` and `courseRunsPrevious`, based on `site.yaml` `course_semesters[0]`.

**Example files**
- `content/people/benny-kimelfeld.md`
- `content/publications/2018-pods-joining-extractions.md`
- `content/news/2026-09-17-visit-of-christoph-standke-from-rwth-aachen.md`
- `content/courses/databases.md`

**Automated publication fetching: there is none.**
- Nothing in the build or CI queries DBLP, ORCID, Crossref or Scholar.
- Publications are hand-filed Markdown files.
- The `tdk-add-accepted-papers` skill tells the agent to look up the citation and DOI by hand with `curl` against the **Crossref** API. It notes that "DBLP is behind a bot wall from this machine".
- Profile links (`dblp`, `orcid`, `scholar`) are just URLs on people.
- The `tdk-refresh-courses` skill scrapes the Technion CS course registry (`POST https://www.cs.technion.ac.il/courses/myresponse.php`). The agent does this by hand; it is not automated.

**Validator warnings** (`tools/validate.js` → `checkWarnings`, non-fatal):
- a publication with no links
- a `to-appear` paper whose year has passed
- a `paper`-tagged news item that references no publication
- publications with no areas
- an active person with no photo
- a course with no lab-member run, or with no number
- author names that match no person

**Stale counts in the docs.** `CLAUDE.md` "Status" says 43 people, 93 publications, 88 news items, 10 courses and 109 pages built. The repo actually has 48 / 92 / 87 / 5, and the live sitemap lists 105 URLs. The live site renders 92 publications, 22 person cards, 26 alumni and 87 news teasers, which matches the repo.

## 4. Deploy

**Workflow (`.github/workflows/deploy.yml`)**
- Name: "Deploy to GitHub Pages". Triggers: `push` to `main`, and `workflow_dispatch`.
- `permissions`: `contents: read`, `pages: write`, `id-token: write`.
- `concurrency`: `group: pages`, `cancel-in-progress: true`.
- Job `build` (ubuntu-latest):
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 22, npm cache)
  3. `npm ci`
  4. `npm run build` (validates, then builds)
  5. `npm run linkcheck`
  6. `actions/configure-pages@v5`
  7. `actions/upload-pages-artifact@v3` (path `_site`)
- Job `deploy`: `needs: build`, `environment: github-pages`, `actions/deploy-pages@v4`.
- If validation or the link check fails, nothing is published.
- There are no other workflows.

**Pages config** (from `GET /repos/.../pages`):
- `build_type: "workflow"` (source = GitHub Actions)
- `cname: "tdk.cs.technion.ac.il"`
- `https_enforced: true`
- certificate `approved`, expires 2027-02-14
- `custom_404: false`; the site's own `/404.html` is served anyway with HTTP 404

**CNAME file.** There is none in the repo. The custom domain is set only in the Pages settings. `docs/deploy.md` explains that a custom Actions workflow neither commits nor needs a `CNAME` file.

**DNS.** `tdk.cs.technion.ac.il` is a CNAME to `techniontdk.github.io` (verified with nslookup).
- `http://tdk.cs.technion.ac.il/` returns 301 to https.
- `https://techniontdk.github.io/` returns 301 to `https://tdk.cs.technion.ac.il/`.

**`docs/deploy.md` summary**
- "`git push` *is* the deploy."
- **One-time setup:**
  - The repo must be named `techniontdk.github.io`, because every path is root-relative and a project subpath would break them.
  - The repo must be public (free-plan Pages).
  - Settings → Pages → Source must be **GitHub Actions**, not branch/Jekyll.
- **Custom domain:**
  - CS IT ("Konstantin") set the DNS CNAME on 2026-09-17. Custom domain and Enforce HTTPS were set in Pages settings the same day.
  - The doc explains the CDN cache lag (up to about an hour), and that a 404 on a fresh domain means the domain is not yet claimed in settings.
- **Certificate:** GitHub issues a Let's Encrypt certificate automatically, so none needs to be bought. The `technion.ac.il` CAA record lists `letsencrypt.org` alongside harica.gr, sectigo.com and digicert.com, so issuance is allowed.
- **"Security" section:** see §7.
- **Troubleshooting:** a failed build, an unchanged site, unstyled pages with 404 links, and certificate or 404 errors on the custom domain.

## 5. Accessibility

**Accessibility statement.** The TDK site **has no accessibility statement page of its own**.
- The footer links to the Technion-wide English statement: `https://www.technion.ac.il/en/accessaility-statement/`. The "accessaility" misspelling is in Technion's actual URL.
- The link is configured in `content/site.yaml` `footer.links`.
- There is no Hebrew link and no lab-specific contact.

Summary of the linked Technion statement. Both versions were fetched; both say last updated 23 Dec 2025.
- **Opening (EN "Accessibility Statement" / HE "הצהרת נגישות"):**
  - The Technion runs hundreds of sites managed by different units.
  - The statement is attached to accessible sites, so a site linking to it "should be accessible".
  - Personal sites of academic and research faculty are exempt by law and must be made accessible only on demand.
  - About 20% of Israelis have disabilities of some kind.
- **"Website accessibility" / "נגישות אתרי אינטרנט":**
  - The Technion commits to level **AA per Israeli Standard 5568** (ת"י 5568).
  - It lists these features:
    - font enlargement via an **accessibility bar at the side of the screen**
    - high contrast and inverted colours via that bar
    - screen-reader adaptations: semantic structure, skip links, lists, tables, forms, ALT text
    - meaningful link text
    - keyboard navigation (arrows, Tab, Enter)
    - support for common browsers (Chrome, Mozilla, Explorer, Safari)
    - no flashing or fast animation
    - mobile compatibility
    - stop/start controls on dynamic slideshows
  - Testing was done with the latest NVDA.
  - Wording difference: EN says "The TRDF's websites were tested…"; HE says "הבדיקות לאתרי המוסד" (the institution's sites).
- **"Physical Accessibility on Campus" / "נגישות פיסית בקמפוס":** links to `https://accessibility.net.technion.ac.il/`.
- **"Contacts" / "אנשי קשר":**
  - **Technion Accessibility Coordinator** (רכזת נגישות טכניונית): **Dikla Nachman** (דקלה נחמן), 073-378-1956, adminlogistic@technion.ac.il.
  - There is also a link to the full accessibility-contacts list at accessibility.net.technion.ac.il.
- **"Assistance" / "סיוע":**
  - Some items may still be inaccessible. Users are asked to contact "the site manager according to the contact details on the website", or the support centre at **04-829-5600**.
  - EN: email **wp@technion.ac.il** "to report lack of accessibility".
  - HE: a link to a reporting **form** ("לדיווח על פערי הנגשה אנא מלאו טופס") at `hangasha.net.technion.ac.il/דיווח-פערי-הנגשה/`.
- The statement describes an accessibility bar with font-size and contrast toggles. **The TDK site has no such bar.**

**Skip link**
- `<a class="skip-link" href="#main">Skip to content</a>` is the first element in `<body>` (`src/_includes/layouts/base.njk`).
- It targets `<main id="main">`.
- The CSS keeps it off-screen until focused (`.skip-link`, `.skip-link:focus` in `src/css/site.css`).
- `html { scroll-padding-top }` keeps anchor targets clear of the sticky header.

**Focus styles**
- Global `:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-focus) 60%, transparent); outline-offset: 2px; }`, with `--color-focus: #0071e3`.
- `:target` highlights `.person:target` and `.pub:target`.

**Other a11y details found**
- Contrast ratios are documented in comments on the `:root` tokens: accent 5.8:1, muted 8.1:1, faint 5.0:1. README asks to keep 4.5:1.
- Landmarks: `nav aria-label="Main"`, `nav aria-label="Footer"`, and `aria-label` on the people and publications jump navs.
- `aria-current="page"` on the active nav item.
- Mobile toggle: `<button aria-expanded aria-controls="site-nav" hidden>`. It is unhidden only by JS, so with JS off the nav stays expanded.
- Abstracts use native `<details>`/`<summary>`.
- Decorative images use `alt=""`. Thumbnails that duplicate a link get `tabindex="-1" aria-hidden="true"` (`partials/news-teaser.njk`). Initials placeholders are `aria-hidden`.
- Live audit of all 105 pages: 0 `<img>` without `alt`, exactly one `<h1>` per page, no `<form>`, and every `target="_blank"` has `rel="noopener"`.
- `@media (prefers-reduced-motion: reduce)` disables transitions and transforms. There is also a `@media print` stylesheet.

**Accessibility toolbar or widget.** None, first- or third-party. The only script is `src/js/nav.js` (the mobile nav toggle).

**lang and dir**
- `<html lang="en">` is hard-coded (`base.njk`), and all 105 live pages have it.
- There is no `dir` attribute. The RSS feed has `<language>en</language>`.

**RTL support.** None.
- No Hebrew text appears anywhere in `content/` or `src/`.
- The CSS mixes physical properties (`padding-left`, `margin-left/right`, `border-left`, `text-align: left`, `left:`) with some logical ones (`margin-inline`, `padding-inline`, `margin-block`).

**A11y testing in CI.** None: no pa11y, axe, Lighthouse or HTML validation. CI runs only the content validator and the internal link checker.

## 6. Privacy

**Privacy policy page.** TDK has no privacy page of its own.
- The footer links to the Technion-wide English policy, `https://www.technion.ac.il/en/privacy-policy/`, last updated 1 Sep 2025.
- A Hebrew version exists at `/מדיניות-פרטיות/` but is not linked.
- Sections (EN; HE headings in brackets):
  - **General** (כללי): covers all Technion websites and services; using the site means consent.
  - **Controller of the Database** (בעל שליטה במאגר המידע): the Technion; sysaid@technion.ac.il or WhatsApp 073-3785600.
  - **Data Protection Officer** (ממונה על הגנת הפרטיות): dpo@technion.ac.il.
  - **Collection of Information:** data the user volunteers, mailing-list sign-ups, and automatic collection (cookies).
  - **"Personal Information"** (definition).
  - **Purposes of Use:** includes analytics, research, marketing (with consent) and direct mailing.
  - **Period of Information Retention.**
  - **Transfer of Information to Third Parties:** includes processors abroad, and payment clearing via Tranzila/Interspace Ltd.
  - **Links:** external sites and social networks are not the Technion's responsibility.
  - **Cookies** (עוגיות): may record pages visited, referrer and device. The Technion may let third-party analytics or advertising providers set cookies.
  - **Direct Mailing.**
  - **Information Security.**
  - **Rights of Data Subjects:** review, correction and deletion, via the DPO.
  - **Applicable Law and Jurisdiction:** Israeli law; Haifa district courts.
  - **Changes and Updates.**
  - **Download the document** (a PDF link).

**What the TDK site actually does**
- **Analytics and trackers:** none. There is no GA, gtag, Plausible or any other tracker, in the repo or on the live site.
- **Cookies:** none. There is no cookie banner and nothing sets cookies. The response headers include no `Set-Cookie`.
- **Forms:** none.
- **Embeds:** none, so no iframes, maps or video. The Contact page uses a plain link to Google Maps instead of an embedded map (`content/pages/contact.md`).
- **Stated rule** (`CLAUDE.md`, `README.md`, `docs/deploy.md`): "make no external requests at runtime (no CDN fonts, scripts or analytics)". The site must also be "fully usable with JavaScript disabled".

**External origins loaded by the homepage HTML: none.** Every `src` and `<link href>` is same-origin:

- `/css/site.css`
- `/js/nav.js`
- `/assets/images/site/favicon.png`
- `/assets/images/site/logo-tdk.svg`
- `/assets/images/site/logo-cs.png`
- `/assets/images/site/logo-technion.png`
- `/assets/images/areas/*.svg`
- `/assets/images/news/...`
- `/feed.xml` (an alternate link only)

Other checks:
- The CSS contains no `url()`, `@import` or `@font-face`.
- `logo-tdk.svg` references only the `http://www.w3.org/2000/svg` namespace.
- The only external URLs in the homepage are hyperlinks (not loads), to `https://www.technion.ac.il` (×3: privacy, accessibility and the Technion logo link) and `https://cs.technion.ac.il`.
- Across **all 105 sitemap pages**, zero `img`, `script`, `link`, `iframe`, `source`, `video`, `embed` or `object` elements load from an external origin. There is also no inline `<style>`, `style=` or inline `<script>`.
- External **hyperlinks** across the site go mostly to technion.ac.il, doi.org, arxiv.org, dl.acm.org, personal pages and LinkedIn.

## 7. Security

**Content Security Policy.** None, neither as a meta tag nor as a header.
- Live headers are GitHub Pages defaults only: `Server: GitHub.com`, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600`, ETag and Fastly/Varnish headers.
- There is also **no** HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` or `Permissions-Policy`.
- `docs/deploy.md` gives the reasoning: Pages cannot set custom headers. The build emits no inline script or style, forms, iframes or external loads, so "there is nothing for a CSP to defend".
- No `<meta http-equiv>` CSP or `<meta name="referrer">` is used either.

**Dependabot.** No `.github/dependabot.yml`. `.github/` contains only `workflows/deploy.yml`.

**Actions pinning**
- Actions are pinned by **major version tag, not commit SHA**: `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`.
- `permissions` are scoped at workflow level (`contents: read`, `pages: write`, `id-token: write`).
- There is no `persist-credentials: false` and no harden-runner.
- `npm ci` installs from the lockfile.

**Other hardening and stated posture**
- `docs/deploy.md` "Security": static files only, so no server, PHP, database, admin login or upload directory. "The only way to change the site is a push to `main`. So: protect the GitHub account (2FA), and that is the whole attack surface."
- No secrets are in the repo: `deploy.env` was gitignored from the start and has since been removed.
- No `security.txt` (`/.well-known/security.txt` returns 404) and no `robots.txt` (404).
- External links opened in new tabs carry `rel="noopener"`.
- The validator rejects HTML in front-matter fields. Content Markdown is never run through a template engine (`markdownTemplateEngine: false`).

## 8. Agent support

**`CLAUDE.md`** (no `AGENTS.md` exists)
- **Architecture:** data (`content/` + `assets/`) is the source of truth; the generator (`src/` + `eleventy.config.js`) is "changed rarely".
- **Status:** see the stale counts noted in §3.
- **Rules:**
  - Every fact lives in one file; cross-reference by slug.
  - `content/` holds no generator files; all type→URL/layout mapping is in `routeFor()`.
  - Asset paths start with `/assets/`.
  - Run `npm run validate` after content changes, and `npm run build && npm run linkcheck` after generator changes.
  - Never edit or commit `_site/`.
  - **No CSS or JS frameworks.** Use plain CSS with `:root` custom properties. `nav.js` is the only JS.
  - The site must work without JS and make no external runtime requests.
  - Do not re-run `tools/scrape/`.
  - Work on `main`; commit and push only when asked.
- **"Content update tasks" protocol:**
  1. Use a matching skill from `.claude/skills/`.
  2. If none matches, ask the manager only the judgment calls, batched in one round, then do the work.
  3. Never write a skill on your own initiative. Propose it in one line and write `.claude/skills/tdk-<task-slug>/SKILL.md` only if the manager agrees. A skill earns its place when the task spans several files, involves cross-references, or raises a question that would otherwise be asked every time.
  4. Fold corrections into the existing skill (bump `Updated:`); delete wrong skills.
- **Skill conventions:** a skill carries judgment, not field lists (it links to `SCHEMA.md`). It fits on one screen. The name is `tdk-<task-slug>`. The description lists the manager's actual phrasings. The body has four sections: `Ask first` / `Settled` (dated decisions) / `Steps` / `Check`.
- **"Where a change belongs":**
  - tokens and layout → `site.css`
  - fields and order → partials, layouts, pages
  - content files never carry `layout`, `permalink` or styling flags; vary a record by its `id` or by adding a real schema field
- Also lists the commands and docs.

**Every file under `.claude/`:** no `settings.json`, no `commands/`, no agents. There are three skills:

| File | What it does |
|---|---|
| `.claude/skills/tdk-add-accepted-papers/SKILL.md` | Files an accepted or published paper as `content/publications/<year>-<venue>-<keywords>.md`. When the paper is being *announced*, it also writes a news item with `publications: [slug]`. Settled rules (2026-09-10): every announced paper gets a record; no `selected` flag; the news body must not restate title and authors; `areas` is optional; `to-appear` semantics. Looks up the citation and DOI via the Crossref API, accepting only exact title+year matches. Updated 2026-09-17. |
| `.claude/skills/tdk-add-news-item/SKILL.md` | Writes up an event, visit or talk as `content/news/YYYY-MM-DD-<slug>.md`. Images go to `/assets/images/news/<year>/`. Uses the closed tag list. Cross-references `people:` (lab members only) and `publications:`. Settled: the date defaults to today; visitors are never added to `people/`; no image-size standard. Worked example: the Christoph Standke visit. Updated 2026-09-17. |
| `.claude/skills/tdk-refresh-courses/SKILL.md` | Re-derives the whole Courses page from the Technion CS course registry. The window is the current semester plus the three before it. It scrapes the `myresponse.php` JSON endpoint and matches lecturers on full name; surname-only matching gave false positives. One entry per run. Many dated decisions: which runs qualify, 8-digit numbers, a hand-fixed course number, Android Development excluded, link precedence. Updated 2026-09-22. |

**`README.md` summary.** This is the human guide.
- **Getting started:** `npm install`, then `npm run dev` (live reload on `content/` and `src/`).
- **The everyday loop:** edit content, then validate.
- **Common-tasks table:** a paper is 2 files (publication + news); a new member is 1 file + photo; a graduate gets `status: alumni`; plus events and guides.
- **"Tuning the look":** the `:root` token table and a contrast caution.
- **Other sections:** Publishing (`git push`), commands, troubleshooting, editing rules, the skills overview, a repo layout tree, a 5-step "Adding a new page type" recipe, and "Decisions worth knowing":
  - no per-person pages
  - no `eleventy-img`
  - `/publications/` lists every paper (the old curated list went stale for six years)
  - `markdownTemplateEngine: false`
- **Out of date vs. the current CSS** (after the 2026-11-10 redesign):
  - README calls `--color-accent` "the bordeaux"; the CSS says crimson `#c3004f`.
  - README calls `--font-display` "the serif"; the CSS uses a system sans stack.
  - README gives measures of ~44rem/~72rem; the CSS has 42rem/70rem.

**`MIGRATION_REPORT.md` summary.** "Step A" of the migration from the old WordPress site, fetched 2026-09-07.
- **Counts at migration:** 43 people, 7 areas, 20 publications (from 26 entries; 6 merged duplicates), 87 news items, 2 projects, 4 pages, 1 guide, 78 assets.
- **Judgment calls recorded:**
  1. One tagline was derived rather than taken verbatim.
  2. Contact-page person data is not duplicated. The People and Contact pages give conflicting phone numbers for Benny Kimelfeld; a human must decide. Fax numbers were dropped.
  3. Venue names were normalised.
  4. Area images were moved to front matter.
  5. News detail pages were merged with index excerpts.
  6. A keyword heuristic assigned news tags; the resulting counts are given.
  7. News `people:` links are filled only from full names in titles.
  8. News slug rules.
  9. `order` is numbered in tens.
- **Open issues:**
  - a 404'd Haaretz PDF
  - a missing gallery on the Aug-2025 lab-meeting item
  - placeholder images skipped
  - `dean-light.md` has a URL in `office`
  - 5 expected validator warnings
- **Not migrated:** the Resources page (replaced by `guides/`), sliders, dead social icons, fax numbers, and the JS news ticker.
- **Conversion notes:** no HTML remains in `content/`; Tailwind attributes from pasted chat text were stripped; original-resolution images were recovered.

**Scraper (`tools/scrape/README.md`).** Two stages: `fetch.js` crawls into a gitignored cache (sequential, 400 ms delay, custom User-Agent), and `extract.js` deterministically turns that cache into `content/` and `assets/`. It is marked "do not run again".

## 9. Languages and page list

**Language.** **English only.** There is no Hebrew content, no language switcher, no i18n setup and no `dir`.

**Main navigation** (`content/site.yaml` `nav`; the same list is repeated in the footer):

| Label | URL | Source |
|---|---|---|
| About | `/about/` | `content/pages/about.md` (title "Our Mission") |
| People | `/people/` | `src/pages/people.njk` |
| Research | `/research/` (+ `/research/<area>/` ×7) | `src/pages/research.njk`, `layouts/area.njk` |
| Publications | `/publications/` | `src/pages/publications.njk` |
| News | `/news/` (+ `/news/<year>/<slug>/` ×87) | `src/pages/news.njk`, `layouts/news-item.njk` |
| Projects | `/projects/` | `src/pages/projects.njk` |
| Guides | `/guides/` (+ `/guides/connecting-to-slurm/`) | `src/pages/guides.njk`, `layouts/guide.njk` |
| Courses | `/courses/` | `src/pages/courses.njk` |
| Contact | `/contact/` | `content/pages/contact.md` |

- Homepage: `/`.
- Other outputs: `/404.html`, `/sitemap.xml`, `/feed.xml` (RSS 2.0, latest 30 news items).
- Footer extra links: Accessibility and Privacy, both to Technion pages.
- Footer affiliation logos: Faculty of Computer Science (cs.technion.ac.il) and Technion (technion.ac.il).

## 10. Visually distinctive components, CSS approach, fonts

**CSS approach**
- One hand-written plain-CSS file, `src/css/site.css` (1,040 lines). No Sass, Tailwind or framework, and no build step for CSS.
- Design tokens are custom properties in `:root`:
  - colour: brand `#e6005a`, accent `#c3004f`, a blue `#3a6fd8` used for the gradient, and Apple-like greys (`#1d1d1f`, `#f5f5f7`)
  - type scale `--size-xs`…`--size-3xl` (with `clamp`)
  - space scale `--space-1`…`--space-9`
  - measures (prose 42rem, wide 70rem)
  - radii (8/12/20px, pill), shadows and easing
- Uses modern CSS: `color-mix()`, `:has()`, `text-wrap: balance/pretty`, `aspect-ratio`/`object-fit` for image cropping, `backdrop-filter`.
- Breakpoints: 60rem (nav collapses), 48rem, 34rem. Also reduced-motion and print rules.
- The header comment states the aesthetic: "the system typeface set large and tight, plenty of air, white and soft-grey bands, rounded tiles, and one accent — the crimson of the logo's angle brackets".

**Fonts.** System stacks only; nothing is downloaded.
- Body: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- Display: the same stack with the "Display" variants.
- Mono: `ui-monospace, "SF Mono", …`.

**Components**
- **Header** (`partials/header.njk`):
  - Sticky, translucent white bar with `backdrop-filter: saturate(180%) blur(20px)`.
  - SVG wordmark logo on the left (`logo-tdk.svg`, 448×86).
  - 9 small nav links on the right; the active link is semibold with `aria-current`.
  - Below 60rem a "Menu" hamburger button animates to an X and the nav becomes a vertical list.
- **Footer** (`partials/footer.njk`), a grey band in two rows:
  - Top row: logo and a repeated nav.
  - Bottom row: copyright and the Accessibility/Privacy links on one side; affiliation logos on the other, **greyscale at 70% opacity until hover**.
- **Homepage** (`src/pages/index.njk`), built from alternating white and grey "bands":
  - **Hero:** centred. An eyebrow line lists the affiliations. The H1 shows the lab name with "Data & Knowledge" in a crimson→pink→blue gradient text. There is a soft radial colour wash behind it, the intro paragraph from `home.md`, and two pill buttons ("Explore our research" solid, "Meet the people" outline).
  - **Research band:** grid of area cards (3:2 SVG image, title, tagline; lift-and-shadow on hover).
  - **Latest news:** 5 teasers.
  - **In pictures:** 4 photo cards from news items that have a cover.
  - Each section head has a "›" chevron "more" link.
- **People** (`src/pages/people.njk`, `partials/person-card.njk`, `person-compact.njk`):
  - A pill-shaped "jump" nav for the groups.
  - Group sections: Faculty, Visiting, Postdoc, Staff, Ph.D., M.Sc., Developers.
  - Cards are grey rounded tiles in an auto-fill grid (min 20rem). Each has a circular 5.5rem photo, or a grey-gradient **initials monogram** if there is no photo.
  - Card text: name with honorific, role or "<degree> student", "Advised by …" with links, interests, a contact row (email, Website, Office, phone) and a profile-links row (Google Scholar, DBLP, ORCID, GitHub, LinkedIn…).
  - Each card has `id=<slug>`, and `:target` draws an accent ring.
  - **Alumni** are a compact 3-column list: name, degree, email/website links.
- **Publications** (`src/pages/publications.njk`, `partials/publication.njk`):
  - A year jump nav. Each year group has a **sticky large pale year number in a left column** (9rem).
  - Each entry has:
    - a title that links to the paper
    - authors, with lab members linked to their people anchors and set in a darker medium weight
    - an italic venue/citation, with "to appear" or "preprint" chips
    - uppercase small-caps-style links (DOI ›, ARXIV ›, PAPER ›)
    - area chips (pills linking to area pages)
    - a collapsible `<details>` "Abstract +" whose + rotates to ×
  - The same partial is reused on area pages and news items.
- **News:**
  - The list (`src/pages/news.njk`) uses the same sticky-year layout. Teasers (`partials/news-teaser.njk`) have a 3:2 thumbnail at 11rem, date, title, and the summary or the first paragraph truncated to 220 characters.
  - Item pages (`layouts/news-item.njk`) have:
    - a breadcrumb
    - date and tag chips
    - a wide 16:9 rounded cover
    - the body
    - a "Photos" gallery grid
    - "Lab members" pills
    - a "Papers" section that renders the full publication entries
- **Research area page** (`layouts/area.njk`):
  - breadcrumb, title, lede tagline
  - the SVG figure
  - the overview
  - "People" pills (active members only)
  - "Collaborators" pills with affiliation
  - the area's publications
- **Projects:** grey tiles with an image column and audience chips. **Courses:** grey tiles with a monospace course number, split into current-semester and previous-semesters lists. **Guides:** a simple list with an "Updated" date.
- **Images:** all are original files copied through unchanged; CSS does the cropping. Area and project images are original SVG drawings.
