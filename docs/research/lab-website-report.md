
## Reference lab websites for inspiration

Seven research agents searched GitHub and the web: Ivy League universities first, then other top US
universities, then worldwide, including Israel. They checked about 2,000 university repositories.
**I re-verified every site in table A myself:** each live site is served by GitHub
(`server: GitHub.com`) and its public repo's `package.json` lists Eleventy.

### What the search found

- **Eleventy lab sites are rare, especially in the Ivy League.** The search found **no**
  Eleventy-plus-GitHub-Pages lab site at Harvard, Yale or Princeton, and only one at Columbia
  (Barnard). Most Ivy labs use **Jekyll** (GitHub's older default generator); a few use Hugo or
  Astro.
- Good Eleventy lab sites do exist at **MIT, Stanford, Berkeley and Georgia Tech**, and in Europe
  and Canada.
- **No Eleventy lab site turned up at any Israeli university other than TDK.**
- Several labs, including two Ivies, already keep **`CLAUDE.md` / `AGENTS.md` files and Claude
  skills** in their website repos. **Penn's PATCH Lab has a Claude Code skill that updates its
  publications**, which is exactly what we want.


### A. Eleventy + GitHub Pages + public repo (closest to our setup)

| Lab | University | Live site · Repo | Worth borrowing |
|---|---|---|---|
| **Autonomous Multi-Robots Lab** | TU Delft | [autonomousrobots.nl](https://autonomousrobots.nl) · [tud-amr/website](https://github.com/tud-amr/website) | **The best AI-ready reference.** Its `CLAUDE.md` is written for agents. It has a `validate` command, an `add-pub` command that creates a paper entry from BibTeX, **automatic phone and desktop screenshots** after changes, and a check that old URLs never break. |
| **Adesnik Lab** (neuroscience) | **UC Berkeley** | [adesnik.berkeley.edu](https://adesnik.berkeley.edu) · [hadesnik/adesnik-lab-website](https://github.com/hadesnik/adesnik-lab-website) | `CLAUDE.md`. All content is in JSON data files, with a README table of "to change X, edit file Y" for non-programmers. People with no photo get an initials avatar. A daily **uptime monitor** emails a diagnosis if the site goes down. |
| **ARCH group** (CSAIL) | **MIT** | [arch.csail.mit.edu](https://arch.csail.mit.edu) · [mit-arch/www](https://github.com/mit-arch/www) | People split by role in YAML, a seminar series in YAML, and a `new-seminar` helper script. Clean and simple. |
| **Literary Lab** | **Stanford** | [litlab.stanford.edu](https://litlab.stanford.edu) · [literarylab/literarylab.github.io](https://github.com/literarylab/literarylab.github.io) | **MIT license.** Publications rendered from **BibTeX** (`eleventy-plugin-bibtex`). The README is an editing guide for non-developers. |
| **Language Acquisition & Development Lab** | **Barnard / Columbia** | [suvitca.github.io/barnard-ladr](https://suvitca.github.io/barnard-ladr/) · [suvitca/barnard-ladr](https://github.com/suvitca/barnard-ladr) | `CLAUDE.md`. Every data file carries editing instructions at the top, so the PI can edit directly on github.com. Alumni move to the alumni section automatically. |
| **Stroud Lab** (biology) | **Georgia Tech** | [thestroudlab.com](https://www.thestroudlab.com) · [jameststroud/jameststroud.github.io](https://github.com/jameststroud/jameststroud.github.io) | A **weekly automatic check of ORCID and Crossref that opens a "new publications to review" pull request**. Publication search. Google Scholar meta tags per paper. Cookieless GoatCounter statistics. |
| **HUBS Lab** | U. Arizona | [hubs.engr.arizona.edu](https://hubs.engr.arizona.edu) · [humanbuildingsynergy/…github.io](https://github.com/humanbuildingsynergy/humanbuildingsynergy.github.io) | The richest publication pipeline: ORCID + Crossref, a manual-overrides file, and a **cache so the build survives when those services are down**. |
| **Ziems group** | U. Southampton | [ziemsgroup.org](https://ziemsgroup.org) · [QCCD-Soton/Website](https://github.com/QCCD-Soton/Website) | One Markdown file per person. A weekly ORCID/OpenAlex publication pull. A "who edits what" table in the README. |
| **MIST Lab** | Polytechnique Montréal | [mistlab.ca](https://mistlab.ca) · [MISTLab/mistlab.github.io](https://github.com/MISTLab/mistlab.github.io) | Weekly ORCID → `publications.json` commit. The old site is kept as a static archive. |
| **FoRML** | U. Copenhagen | [cope-forml.github.io](https://cope-forml.github.io) · [cope-forml/…github.io](https://github.com/cope-forml/cope-forml.github.io) | A BibTeX file plus a `check-publications` script. Job-openings and blog pages. |
| **Thomay Lab** | U. Buffalo | [qislab.org](https://qislab.org) · [laserlab/thomaylab-website](https://github.com/laserlab/thomaylab-website) | **MIT license.** Weekly ORCID workflow, featured papers, a journal-club page. |

Not labs, but useful Eleventy-on-Pages examples:
- **BirdNET** (Cornell Lab of Ornithology, [birdnet.cornell.edu](https://birdnet.cornell.edu),
  MIT license): **11 languages**, which is a model if we ever want Hebrew; dark mode; BibTeX
  publications.
- **Digital Humanities @ Stanford**
  ([digitalhumanities.stanford.edu](https://digitalhumanities.stanford.edu)): **site search**
  (Lunr) and **axe accessibility tests** as an npm script.

### B. Ivy League lab sites on GitHub Pages (other generators: ideas, not code)

| Lab | University | Generator | Worth borrowing |
|---|---|---|---|
| **PATCH Lab** · [site](https://patchlab.pennbrain.upenn.edu) · [repo](https://github.com/patchlab-upenn/patchlab-upenn.github.io) | **Penn** | Jekyll | **A Claude Code skill `.claude/skills/update-bibliography/SKILL.md`** (verified). It fetches papers from Semantic Scholar, *merges* them rather than overwriting, keeps an **exclusion list for papers wrongly attributed to lab members**, validates, and reports counts. Accessibility and link checks run in CI. **The best model for our publications skill.** |
| **Systems Group** · [site](https://systems.seas.harvard.edu) · [repo](https://github.com/harvardSys/harvardsys.github.io) | **Harvard** | Hugo | A very good `CLAUDE.md`. People page grouped by role from one data file. |
| **CLAY Lab** · [site](https://clay.yale.edu) · [repo](https://github.com/clay-lab/clay-lab.github.io) | **Yale** | Astro | `CLAUDE.md` documents the data schema. **Decap CMS** gives a web editing form for people who don't use Claude or Git. |
| **Yale NLP (LILY)** · [site](https://nlp.cs.yale.edu) · [repo](https://github.com/yale-nlp/yale-nlp.github.io) | **Yale** | Jekyll | A script pulls papers by Semantic Scholar author ID and removes near-duplicate titles. |
| **SmartNets** · [site](https://smartnets.yale.edu) · [repo](https://github.com/smartnets/smartnets.github.io) | **Yale** | Jekyll | A **weekly scheduled GitHub Action** refreshes publications automatically. |
| **NAP Lab** · [site](https://naplab.ee.columbia.edu) · [repo](https://github.com/naplab/naplab.github.io) | **Columbia** | Jekyll | One `.bib` file is the single source of truth for publications. |
| **Penn NLP** · [site](https://nlp.cis.upenn.edu) · [repo](https://github.com/penn-nlp/penn-nlp.github.io) | **Penn** | Jekyll | Seminar schedule and archive driven by data files. |
| **Visual Computing Lab (IVL)** · [site](https://ivl.cs.brown.edu) · [repo](https://github.com/brown-ivl/brown-ivl.github.io) | **Brown** | Jekyll | Project cards plus one subpage per project. |
| **Serre Lab** · [site](https://serre.lab.brown.edu) · [repo](https://github.com/serre-lab/Lab-Website) | **Brown** | React | `CLAUDE.md` + `AGENTS.md`, publications from `.bib`, automated browser tests. |
| **SNS group** · [site](https://sns.cs.princeton.edu) · [repo](https://github.com/princeton-sns/www) | **Princeton** | Jekyll | Data files for people, projects, publications and seminars. |

Notable Eleventy lab sites at Ivies that are **not** on GitHub Pages:
- **Harvard Library Innovation Lab** ([lil.law.harvard.edu](https://lil.law.harvard.edu),
  [repo](https://github.com/harvard-lil/website-static)): Eleventy with a CloudCannon web editor,
  site search and image optimisation.
- **Barnard Design Tools Lab** ([designtoolslab.org](https://designtoolslab.org)): Eleventy +
  BibTeX, on Netlify.

### C. The most widely used open-source lab template (Jekyll, for ideas)

**Greene Lab "lab-website-template"** ([greenelab/lab-website-template](https://github.com/greenelab/lab-website-template),
about 580★, BSD-3 license, actively maintained). You list each member's **ORCID**, and a weekly
GitHub Action turns their ORCID records into full citations and opens a pull request. Several Yale
labs use it. There is **no equivalent maintained Eleventy lab template**, which makes the TDK repo
unusually valuable as a starting point.

itised)

1. **Publication automation, as a Claude Code skill plus an optional weekly Action** (PATCH, Stroud
   Lab, Greene Lab).
   - For a CS lab, **DBLP** is the best source. It is free, needs no key, and covers CS venues
     well; the TDK citations are already DBLP-style. ORCID and Semantic Scholar are the fallbacks.
     **Avoid scraping Google Scholar:** it is fragile and against its terms (Cornell's Helbling Lab
     disabled theirs).
   - Rules: *merge, don't overwrite*; keep an **exclusion list** for misattributed papers; open a
     **pull request** for a human to approve rather than publishing directly.
2. **Accessibility test in CI** (`pa11y-ci` / axe). See Q6.
3. **Automatic phone and desktop screenshots** that Claude checks after design changes (TU Delft,
   Berkeley). See Q8.
4. **A "to change X, edit file Y" table** in the README for future lab members who are not
   developers (Berkeley, Southampton, Barnard).
5. **Google Scholar meta tags on each publication** (Stroud Lab), so Scholar indexes the lab's
   papers correctly.
6. **Site search** (Pagefind or Lunr), once there are enough pages to need it.
7. **Uptime monitor** (Berkeley): a free scheduled Action that alerts you if the site goes down.
8. **Optionally, a web editing form** (Decap CMS, as at Yale's CLAY Lab) if lab members who don't
   use Claude Code need to edit.

