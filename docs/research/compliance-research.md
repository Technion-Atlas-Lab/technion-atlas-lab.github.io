# Atlas Lab website: what Israeli law and the Technion require (accessibility, privacy, security)

Research date: 17 November 2026. Scope: a static Eleventy site on GitHub Pages, served at a
Technion subdomain (e.g. `atlas.cs.technion.ac.il`, CNAME to `<org>.github.io`). It holds research
descriptions, publications, news and member profiles. It has no forms, logins or server code, and
its content is in English.

This is research, not legal advice. Every claim links to its source. Where I relied on a secondary
source, or could not open a primary one, the text says so. Those items are also collected in
[Unverified points](#unverified-points-and-open-questions).

**How the sources were read.** Several primary sites block automated access. Nevo requires a login.
gov.il sits behind a Cloudflare challenge. `hangasha.net.technion.ac.il` has an F5 bot block, and
`cis.technion.ac.il/kb` now needs a Microsoft login. I read those pages through a search engine's
cached copy (Exa), which returns the page text. Two texts come straight from the Knesset: the 2017
amendment text it approved (a `.doc`) and Amendment 13 as published in Reshumot (a PDF). I checked
the DNS and HTTP headers myself from the Technion network.

---

## Bottom line

1. **Accessibility: the lab site is covered, with one specific partial relief.** The 2016
   higher-education accessibility regulations apply regulation 35 to universities. They add a
   special rule for "websites of research staff or laboratories that are not intended for
   teaching, studies or courses":
   - such sites, if new, must be built "on an accessible platform" under IS 5568;
   - their *content* has to be made accessible only when a student asks for it.

   The Technion implements this rule. It also requires the excluded site to be made fully
   accessible within 60 days of a visitor's demand. No other exemption plausibly applies:
   - the small-turnover exemption does not, because the obligated party is the Technion, not
     the lab;
   - being English-only is not an exemption;
   - being part of a larger institution is not an exemption.
2. **The standard is IS 5568 Part 1, September 2023 edition, which is WCAG 2.0 level AA with
   national changes.** The edition has had no amendment sheets, and no edition adopting WCAG 2.1
   or 2.2 exists as of November 2026. The regulations incorporate IS 5568 "as amended from time to
   time", so a future edition would apply automatically. WCAG 2.2 AA is a safe superset to build
   to.
3. **An accessibility statement is required.** It must be prominent and must list:
   - the adjustments made;
   - the accessibility coordinator's details;
   - a contact for reporting problems.

   The Technion additionally wants every site to link to the institutional statement. Sites tied
   to a campus building must cover physical accessibility, at least by linking to the campus
   accessibility page. Overlay or toolbar widgets are not required, and the Commission says they
   do not make a site compliant.
4. **Privacy:**
   - **Consent.** Get documented, voluntary consent before publishing a member's photo, phone
     number or bio. The Privacy Protection Authority (PPA) regards consent given inside an
     employment relationship as "suspect", and says withdrawal of consent should generally be
     honoured.
   - **The member list is a "database".** It very likely counts as one under the Amendment 13
     definition, so give members the section 11 notice when you collect their details.
   - **No registration by the lab.** Registration is not a lab-level duty; the Technion is the
     controller and has a DPO.
   - **Cookies.** Israel has no cookie-banner law. Using no analytics is the cleanest option.
   - **Hosting disclosure.** A short lab privacy note should mention that GitHub hosts the site
     and logs visitor IP addresses. It should link to the Technion policy, which says it covers
     "all its websites".
5. **Security:**
   - Technion procedure 09-0301 requires the Technion CISO to be involved at the start of any new
     information service.
   - `technion.ac.il` sends HSTS with `includeSubDomains` (I checked this), so a subdomain site
     must serve valid HTTPS from day one.
   - The `technion.ac.il` CAA record already allows Let's Encrypt.
   - Verify the custom domain in GitHub to block subdomain takeover.
   - The Israel National Cyber Directorate's (INCD) website guidance reduces to 2FA, least
     privilege, off-site backups, a prepared fallback page and DNS change monitoring.

---

## A. Accessibility

### A1. The law, the regulations and the standard

- **Law.** The Equal Rights for Persons with Disabilities Law, 5758-1998. Section 19מב requires
  anyone who provides a public service and employs at least 25 people to appoint an accessibility
  coordinator (רכז נגישות) ([Commission: accessibility coordinators, quoting s.19מב](https://www.gov.il/he/pages/accessibility_coordinators_explained)).
  Regulation 91 of the 2013 regulations sets out how the coordinator is appointed and how their
  details are published (same source).
- **Regulations.** Equal Rights for Persons with Disabilities (Service Accessibility
  Adjustments) Regulations, 5773-2013, Chapter E, Part C (סימן ג'), "Internet services". The
  original regulation 35 was replaced on 26 Oct 2017 by regulations 35 and 35א–35ו. Sources:
  - [the Commission's consolidated text (gov.il PDF)](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf);
  - [the amendment as approved by the Knesset Labour Committee, 18 Sep 2017](https://main.knesset.gov.il/Activity/committees/Labor/RegulationApproved/law180917.doc);
  - [Commission guide "נגישות אתרי אינטרנט", updated 16.03.2026](https://www.gov.il/he/pages/website_accessibility).

  The regulations that matter here:
  - **Reg. 35 (definitions).** "Internet service" means content in any format (text, documents,
    images, video) delivered over the internet through websites, documents or apps, and intended
    to provide a public service or information about one. The "web accessibility standard" is
    *IS 5568, "on its various parts and annexes, as amended from time to time"* (כתיקונם מזמן
    לזמן).
  - **Reg. 35א(א).** Adjustments must follow the standard **at level AA**.
  - **Reg. 35א(ג).** Documents (e.g. PDFs) prepared on or after **26 Oct 2017** must be
    accessible. Fillable forms are the exception and must be accessible whatever their date.
  - **Reg. 35א(ד).** A deviation is not a breach unless the operator was sent a notice demanding a
    fix and did not fix it within a reasonable time, **no later than 60 days**. Alternative access
    must be provided meanwhile.
  - **Reg. 35ב.** The operator is not responsible for content it neither edited nor produced,
    but must provide an accessible infrastructure (e.g. an alt-text field).
  - **Reg. 35ה.** Accessibility statement (see A3).
  - **Reg. 35ו.** Exemptions:
    - a technological exemption, granted by a service accessibility certifier for up to 3+3
      years;
    - social-network platforms;
    - registered-user services with at most 500 participants (content only);
    - VAT-exempt dealers, or average turnover at or under NIS 100,000;
    - existing pre-2017 sites with turnover up to NIS 1M.

    The Commission's guide quotes the small-turnover threshold as NIS 120,000 and states that
    these turnover exemptions do not apply to public authorities
    ([guide, chapter 8](https://www.gov.il/he/pages/website_accessibility?chapterIndex=8)).
- **Standard.** IS 5568 Part 1, *"Web content accessibility guidelines: website accessibility"*:
  - **Current edition:** published 28/09/2023, announced in Reshumot (Y.P. 11720) on 22/10/2023,
    replacing the May 2021 edition, with **0 amendment sheets**
    ([SII standard page](https://www.sii.org.il/he/lobby/standardization/standard-page?id=6751),
    checked Nov 2026).
  - **WCAG basis:** the standard text states it is identical to **WCAG 2.0 (11 Dec 2008)**
    except for the national changes ([IS 5568-1:2023, gov.il copy](https://www.gov.il/BlobFolder/legalinfo/israeli_accessibility_standards_pdf/he/sitedocs_si-5568-1-september-2023.pdf)).
  - **National changes (same source):**
    - SC 1.2.1–1.2.3 (alternatives for audio and video, captions, audio description) move from
      A to AA, so they are still required at AA;
    - 1.2.4 (live captions) and 1.2.5 (audio description) move from AA to AAA, so they are
      **not required**;
    - **2.4.10 Section Headings moves from AAA to AA, so it is required**;
    - **3.1.2 Language of Parts does not apply**;
    - IS 5568 Part 2 covers digital documents.
- **Did it change recently?** The 2023 edition replaced the 2021 edition, and both are
  WCAG 2.0-based. I found no SII edition or Reshumot notice adopting WCAG 2.1 or 2.2. One
  advocacy group, Access Israel, says it asked SII in Dec 2023 to update the standard
  ([Access Israel news](https://aisrael.org/%D7%A2%D7%9E%D7%95%D7%AA%D7%AA-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA-%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%94%D7%92%D7%99%D7%A9%D7%94-%D7%9C%D7%9E%D7%9B%D7%95%D7%9F-%D7%94%D7%AA%D7%A7%D7%A0%D7%99%D7%9D/),
  secondary). W3C states that content conforming to WCAG 2.2 also conforms to 2.0 and 2.1
  ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)). Because the standard is incorporated "as amended
  from time to time", a future edition would bind automatically. Building to WCAG 2.2 AA is
  therefore the low-regret target.

### A2. Does it apply to a university lab site? Exemptions, precisely

**Universities have their own regulations, and those regulations name lab sites.**
The Equal Rights for Persons with Disabilities Regulations (Accessibility Adjustments to Existing
Public Places that are Institutions of Higher Education and to the Higher Education Services
they Provide), 5777-2016, were published 14 Nov 2016 in Kovetz Takanot 7727
([Reshumot PDF, olaw.org.il mirror](https://olaw.org.il/takanot/takanot-7727.pdf);
[Nevo](https://www.nevo.co.il/law_html/Law01/501_479.htm), login required).

- **Reg. 2(a):** the obligated party is **the institution**.
- **Reg. 6(a)** applies the service regulations to institutions. **Reg. 6(a)(3)** reads:

  > "Regulation 35 shall apply, except for photocopied or scanned documents of which the
  > institution has no digital file, and except for time-based media such as audio or video;
  > upon a student's request [these] shall be made accessible … ; **however, websites of research
  > staff or laboratories that are not intended for teaching, studies or courses, established
  > after the commencement day, shall be on an accessible platform according to the said
  > standard; content uploaded to such websites, including websites established before the
  > commencement day, shall be made accessible upon a student's request.**" (my translation)

- **Meaning of "accessible platform".** At the Knesset committee session of 22 Mar 2016, the
  legal adviser explained it as a platform "that has accessibility adjustments, or means that
  enable making it accessible, per the standard"
  ([committee protocol, Open Knesset mirror](https://oknesset.org/meetings/5/7/577489.html);
  secondary mirror of a Knesset protocol).

**How the Technion reads it:**
- Personal sites of faculty members and labs get a *partial exemption for content* "as long as
  [the site] is built on an accessible platform such as WordPress". Any excluded site **must be
  made accessible within 60 days of a visitor's demand**
  ([hangasha: החרגת אתרים של חברי סגל ומעבדות](https://hangasha.net.technion.ac.il/%d7%94%d7%97%d7%a8%d7%92%d7%aa-%d7%90%d7%aa%d7%a8%d7%99%d7%9d-%d7%a9%d7%9c-%d7%97%d7%91%d7%a8%d7%99-%d7%a1%d7%92%d7%9c-%d7%95%d7%9e%d7%a2%d7%91%d7%93%d7%95%d7%aa/)).
- Its summary of the academic reliefs ([hangasha, 03/10/2018](https://hangasha.net.technion.ac.il/2018/10/03/%d7%aa%d7%a7%d7%a0%d7%95%d7%aa-%d7%97%d7%93%d7%a9%d7%95%d7%aa-%d7%9c%d7%94%d7%a0%d7%92%d7%a9%d7%aa-%d7%90%d7%aa%d7%a8%d7%99%d7%9d-%d7%91%d7%90%d7%a7%d7%93%d7%9e%d7%99%d7%94/)):
  - **Lab sites created after 14.11.2016:** the infrastructure must be accessible; content is
    accessible on request.
  - **Documents uploaded since 26.10.2017:** must be accessible.
  - **Scanned documents with no digital file, and academic audio and video:** exempt.
- The CIS knowledge base calls faculty, lab and course sites "new" if published after
  **30.11.2018** ([CIS KB: מהו אתר חדש](https://cis.technion.ac.il/kb/faq/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%90%D7%AA%D7%A8%D7%99%D7%9D/web-accessibility/%D7%9E%D7%94%D7%95-%D7%90%D7%AA%D7%A8-%D7%97%D7%93%D7%A9/)).
  It says lab sites built new "must be built on an accessible platform such as WordPress", with
  content accessible on demand
  ([CIS KB: reliefs for academic sites](https://cis.technion.ac.il/kb/faq/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%90%D7%AA%D7%A8%D7%99%D7%9D/web-accessibility/%D7%9E%D7%94%D7%9F-%D7%94%D7%94%D7%A7%D7%9C%D7%95%D7%AA-%D7%91%D7%94%D7%A0%D7%92%D7%A9%D7%94-%D7%9C%D7%90%D7%AA%D7%A8%D7%99-%D7%9E%D7%95%D7%A1%D7%93%D7%95%D7%AA-%D7%94%D7%A9%D7%9B%D7%9C%D7%94-%D7%92/)).
  The two dates differ, 14.11.2016 against 30.11.2018. Either way, a site launched in 2026 is
  "new".

**What this means for Atlas.** Treat the Eleventy templates, layout, navigation and components as
the "platform", which must conform to IS 5568 at AA. Research text, news, images and uploaded PDFs
must then be made accessible on request, within 60 days under the Technion rule.

For a static site, making all content AA from the start costs little. It also avoids arguing over
where "platform" ends and "content" begins, for example whether alt text counts as content.

**Each exemption checked:**

| Exemption | Source | Does it plausibly cover Atlas? |
|---|---|---|
| Research-staff or lab site not for teaching (HEI reg. 6(a)(3)) | [Reshumot 7727](https://olaw.org.il/takanot/takanot-7727.pdf) | **Yes, partially.** The platform must be accessible; content is accessible on request. It is lost for any part used for teaching, studies or courses, such as course pages, so keep those elsewhere or fully accessible. |
| Small business: VAT-exempt dealer or turnover at or under NIS 100k (120k per Commission); pre-2017 sites under NIS 1M (reg. 35ו(ז)–(ט)) | [regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf), [guide ch. 8](https://www.gov.il/he/pages/website_accessibility?chapterIndex=8) | **No.** The obligated party is the Technion (HEI reg. 2(a)), not the lab, and the site is new. |
| Old documents from before 26.10.2017 (reg. 35א(ג)) | same | Yes, for old PDFs such as pre-2017 papers. Fillable forms are excluded from this. |
| Scanned or photocopied documents with no digital file; audio and video (HEI reg. 6(a)(3)) | Reshumot 7727 | Yes, on request only. The Technion still asks for captions on narrated videos ([hangasha common errors](https://hangasha.net.technion.ac.il/category/accessibility-updates/)). |
| Third-party content not edited or produced by the operator (reg. 35ב), e.g. an embedded YouTube video by others | [regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf), [guide ch. 5](http://www.gov.il/he/pages/website_accessibility?chapterIndex=5) | Yes, for content truly by others. Papers authored by lab members are probably *not* third-party content (unclear; see Unverified). |
| Registered-user service with at most 500 users (35ו(ה)) | regs | Not applicable: the site has no login. |
| Technological exemption (35ו(א)), via a service accessibility certifier | regs | Not needed: a static site has no platform limits. |
| Site in a foreign language | [Commission FAQ](https://www.gov.il/he/pages/website_accessibility_faq) (updated 24.12.2025) | **No.** The FAQ exempts only sites serving a *non-Israeli* public, and "if the site provides a partial service also to Israelis, then it is obligated". Atlas serves Israeli students and applicants. In any case the HEI regulations apply to the institution regardless of language. |
| Unit of a larger institution | HEI reg. 2(a); [hangasha home](https://hangasha.net.technion.ac.il/) | **Not an exemption.** The Technion is liable, and "heads of units are responsible for the accessibility of the sites belonging to their unit". |
| Hosting abroad (GitHub) | [Commission FAQ](https://www.gov.il/he/pages/website_accessibility_faq) | **No.** Obligations apply "regardless of where it is hosted". |

### A3. What the accessibility statement must say

**Regulation 35ה (binding)** ([consolidated regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)):
in addition to regulations 34 and 91(ה), the operator must state, **"in a prominent place"** on
the site, a statement following the standard's guidelines on accessibility statements. It must
include:
- information on the accessibility adjustments made;
- **the accessibility coordinator's details and contact means**, if the body must appoint one;
- **contact details for reporting a lack of accessibility or requesting accessibility**,
  including the 60-day demand under 35א(ד)(1).

If a technological exemption exists, the statement must name it and the alternative adjustments
(35ו(ג)). The Technion has more than 25 employees, so its coordinator must be named. The
Technion's statement gives the coordinator as Dikla Nachman, 073-378-1956,
adminlogistic@technion.ac.il ([Technion statement EN, updated 23 Dec 2025](https://www.technion.ac.il/en/accessaility-statement/)).

**What the Commission says to include** ([guide "הצהרת נגישות", updated 15.04.2026, ch. 2](https://www.gov.il/he/pages/declaration_website_accessibility?chapterIndex=2)):
- date of the last update of the statement;
- the organisation's commitment to accessibility;
- the laws and standards followed, e.g. "WCAG 2.0 or WCAG 2.1";
- the conformance level (A, AA or AAA);
- the measures taken to ensure accessibility;
- technical requirements, such as supported browsers;
- which assistive technologies it was tested with. The [FAQ](https://www.gov.il/he/pages/website_accessibility_faq)
  asks for at least one of JAWS, NVDA, VoiceOver or TalkBack, and for the statement to say
  which;
- known limitations, in plain language: "videos have no captions", not "SC 1.2.2 not met";
- partial conformance for third-party content;
- the coordinator's details, optionally with a separate site contact;
- the organisation's accessibility arrangements: physical access, with regulation 34א requiring
  publication of these ([ch. 3](https://www.gov.il/he/pages/declaration_website_accessibility?chapterIndex=3)).

The Commission also wants:
- the statement easy to find, with **at least two routes** to it (e.g. header and footer) and
  consistent naming;
- current updates on temporary faults.

It offers a non-binding template
([ch. 4](https://www.gov.il/he/pages/declaration_website_accessibility?chapterIndex=4)).

**Date of last check.** Regulation 28 requires a periodic check of the service, including
internet adjustments, at least every 5 years, using the Commissioner's form. The results must be
available to the public ([consolidated regs, reg. 28](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)).
This is an institution-level duty. Stating the date of the last accessibility audit in the lab
statement is good practice; I found no rule saying it must appear there.

**No certificate is needed.** No accessibility certificate is required, and the Commission issues
no "seal" ([FAQ](https://www.gov.il/he/pages/website_accessibility_faq);
[CIS KB](https://cis.technion.ac.il/kb/faq/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%90%D7%AA%D7%A8%D7%99%D7%9D/web-accessibility/%D7%94%D7%90%D7%9D-%D7%99%D7%A9-%D7%A6%D7%95%D7%A8%D7%9A-%D7%9C%D7%94%D7%A9%D7%99%D7%92-%D7%90%D7%99%D7%A9%D7%95%D7%A8-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA-%D7%9E%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA/)).

**Language: must it be in Hebrew? I found no rule requiring it.**
- Regulation 35ה is silent on language.
- Regulation 29(b) says accessible information is given "in the languages in which the
  information is given to the general public"
  ([regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)).
- The Technion publishes an English statement for English sites
  ([EN](https://www.technion.ac.il/en/accessaility-statement/)).

Not verified: whether the guidelines in IS 5568 that 35ה refers to impose a language. I could not
find statement guidelines in the free 2023 Part 1 text. A practical approach: write the statement
in English and link to the Technion's Hebrew statement
([HE](https://www.technion.ac.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/)).

### A4. What the Technion requires; overlay widgets

**Technion requirements and resources:**
- **Responsibility.** Unit heads are responsible for their sites. CIS gives guidance and help.
  The Technion warns that the Ministry's supervisor has issued gap notices with fine warnings,
  and states a NIS 60,000 fine "without proof of damage"
  ([hangasha home](https://hangasha.net.technion.ac.il/)). I did not verify the amount; the
  statute sets statutory damages, indexed.
- **Contacts.** Questions go to wp@technion.ac.il. The Technion's external web-accessibility
  consultant is Eli Ronkin of Group 107 (eli@group107.com). There is a mailing list,
  CIS-HANGASHA-L ([hangasha](https://hangasha.net.technion.ac.il/);
  [updates](https://hangasha.net.technion.ac.il/category/accessibility-updates/)).
- **Statement.** Every faculty or unit site must show an accessibility statement "according to
  the law". Every site of the institution should **link to the institutional accessibility
  statement**, which covers physical, service and digital accessibility. The cached page also has
  a truncated fragment "…מונגשים אין להוסיף הצהרת נגישות". It probably means "sites that are not
  accessible must not add the statement", but this is not verified
  ([CIS KB: מהי הצהרת נגישות](https://cis.technion.ac.il/kb/faq/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%90%D7%AA%D7%A8%D7%99%D7%9D/web-accessibility/%D7%9E%D7%94%D7%99-%D7%94%D7%A6%D7%94%D7%A8%D7%AA-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA/)).
- **Physical access.** Sites tied to buildings, explicitly including "faculties, **labs**,
  offices" that serve the public, must add physical-access details to their statement. A link to
  the campus accessibility site is acceptable by default
  ([hangasha common errors, 10/08/2021](https://hangasha.net.technion.ac.il/category/accessibility-updates/)).
- **Common errors list.** The same post lists the Technion's checklist:
  - one H1 and a heading hierarchy;
  - meaningful link text, avoiding new windows, and stating the file type of links to files;
  - table headers (`th`) and captions;
  - accessible Word and PDF files;
  - captions on narrated videos;
  - alt text, empty for decorative images;
  - accessible forms.
- **Wording.** The institutional statement ([HE](https://www.technion.ac.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/), [EN](https://www.technion.ac.il/en/accessaility-statement/))
  commits to "AA level according to IS 5568". It also says it excludes "personal websites of
  academic and research faculty members who are exempt by law from accessibility and are only
  obligated to accessibility upon demand". The CS faculty statement is an older variant and gives
  webmaster@cs.technion.ac.il ([CS statement](https://www.cs.technion.ac.il/he/accessibility/)).
  I found no Technion text that *mandates* a fixed wording for lab statements.
- **The platform the Technion expects.** WordPress multisite with accessible themes and the
  WP Accessibility plugin ([hangasha WP guide](https://hangasha.net.technion.ac.il/wp-accessibilty-guide/)).
  The CS WordPress service allows only themes and plugins approved by the computer center,
  "due to accessibility limitations"
  ([cswp](https://cswp.cs.technion.ac.il/wordpress-personal-site/)). No Technion rule found
  forbids a non-WordPress static site. The relief text says "an accessible platform *such as*
  WordPress".

**Overlay and toolbar widgets.**
- **The Commission's position (primary)** is in its FAQ "Must I install an 'accessibility
  toolbar'?". It says integrating such toolbars "does not exempt [the owner] from the obligation
  to meet all requirements of the regulations and the standard … or from making all required
  accessibility adjustments", and that "there is no obligation whatsoever to use an
  'accessibility toolbar'". It also says contrast can be built in, with text enlarged through
  the browser ([Commission FAQ](https://www.gov.il/he/pages/website_accessibility_faq),
  updated 24.12.2025).
- **The Technion's practice.** Its WordPress system enables WP Accessibility, which adds skip
  links, a contrast toggle and font enlargement. Its statement describes an "accessibility bar".
  This describes Technion practice; it is not a stated requirement for lab sites. I found no
  Technion document requiring an overlay on a non-WordPress site.

**Recommendation.** Do not add an overlay. Build to AA natively, with:
- real skip links;
- visible focus;
- sufficient contrast;
- browser zoom up to 200%.

---

## B. Privacy

### B1. Publishing names, photos, emails, phone numbers

**The law (Protection of Privacy Law, 5741-1981, as amended by Amendment 13; Amendment 13 was
published 14.8.2024 and in force 14.8.2025)** ([Reshumot, Sefer HaHukim 3287](https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf);
[consolidated text, Wikisource](https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%92%D7%A0%D7%AA_%D7%94%D7%A4%D7%A8%D7%98%D7%99%D7%95%D7%AA);
[PPA unofficial English translations](https://www.gov.il/en/pages/legislation)):

- **s.1.** No one shall infringe another's privacy without consent. **s.3:** "consent" means
  *informed consent, express or implied*.
- **s.2** lists the forms of infringement. Those relevant here:
  - (4) publishing a person's photograph publicly in circumstances that may humiliate them;
  - (6) using a name or picture "for profit";
  - **(9) using information about a person's private affairs for a purpose other than that for
    which it was given;**
  - (11) publishing matters of intimate life, including health.

  Ordinary staff photos and work contact details are not inherently (4) or (11). The real risk is
  **(9)**: data a student or employee gave the Technion for study or HR purposes, reused for a
  public web profile.
- **"Personal information"** (s.3, as amended) means any datum about an identified or
  *identifiable* person, including by "an online identifier"
  ([PPA Q&A on Amendment 13](https://www.gov.il/he/pages/tikun13_qa), 14.08.2025).

**Is consent needed?** The PPA's final opinion on consent, of 25.02.2026, says
([PPA: גילוי דעת בנושא הסכמה](https://www.gov.il/he/pages/consent-2026)):
- consent must be informed;
- in "power-imbalance" settings, explicitly including **employment**, consent is "suspect", and
  the requester may bear the burden of showing it was free;
- providing a reasonable alternative helps establish that it was free;
- silence is not consent, and oral consent should be documented;
- a request to **withdraw** consent "should be considered favourably" even where consent was
  irrevocable;
- consent for one purpose does not permit another.

For a lab site this means:
- **Get documented, voluntary, opt-in consent for photos, office phone, bios and personal
  links**, and offer a no-photo option.
- **Students are especially in scope.** They are not employees, but their relationship with the
  supervisor is an obvious power imbalance.
- **Name, role and Technion email** are lower risk. Getting them included in the same consent is
  the safe course.

My interpretation: the law does not itemise "staff directory" publishing. The MUST-level
conclusion follows from s.1, s.2(9) and the PPA opinion, not from a dedicated rule.

**Is the member list a "database"?** Probably yes.
- Amendment 13 defines a database as a collection of personal information processed digitally.
  It excludes collections with *only* name, address and contact details for up to 100,000
  people, and only if the owner has no other collection about the same people
  ([Reshumot 3287, s.3](https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf)).
- Atlas's list adds photo, role and ORCID, and the Technion holds HR and student records on the
  same people. The exclusion therefore does not apply.

**Registration or notification?** After Amendment 13 (s.8א), registration is required only for:
- data-broker databases with more than 10,000 people;
- databases controlled by a public body under para (1) of the s.23 definition, unless they hold
  employees' data only.

A separate notice duty applies to databases holding "special sensitivity" data on more than
100,000 people ([PPA Q&A](https://www.gov.il/he/pages/tikun13_qa);
[Reshumot 3287](https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf)).

- Universities are "public bodies" through the 1986 Order, which sits under para (2) of the s.23
  definition ([Order, Nevo](https://www.nevo.co.il/law_html/law00/71633.htm)). That makes the DPO
  duty apply ([PPA Q&A](https://www.gov.il/he/pages/tikun13_qa) lists "institutions of higher
  education"), but on the statute's wording it does not trigger the s.8א registration duty.
- **For the lab:** no registration or notification of its own. The Technion is the controller,
  and the DPO is dpo@technion.ac.il ([Technion privacy policy](https://www.technion.ac.il/en/privacy-policy/)).
- Not verified: whether the PPA treats institutions of higher education as para (1) bodies.

**Notice when collecting members' data (s.11, as amended).** When asking a person for personal
data for a database, state:
1. whether providing it is a legal obligation or voluntary, and the consequence of refusing;
2. the purpose;
3. **(new)** the controller's name and contact details;
4. who will receive it and why;
5. **(new)** the rights to inspect (s.13) and to request correction (s.14)

([Reshumot 3287, s.8 of the amending law](https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf)).
Failing to give this notice, then not curing it within 30 days of a demand, exposes the
controller to damages without proof of harm of up to NIS 10,000 (s.15א, same source).
**Use this as the member intake form.**

**Rights to removal.**
- **s.13.** Right to inspect the data, in Hebrew, Arabic or English.
- **s.14.** If the data is incorrect, incomplete, unclear or outdated, the person may ask for
  correction **or deletion**
  ([Wikisource consolidated text](https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%92%D7%A0%D7%AA_%D7%94%D7%A4%D7%A8%D7%98%D7%99%D7%95%D7%AA)).
- There is no general "right to be forgotten" in the statute. The PPA consent opinion still
  expects withdrawal of consent to be honoured in principle.
- **Practical caveat:** a public Git repository keeps the old content in its history. Decide
  whether removal requests will be handled by deleting the data from the current site only or by
  rewriting history, and say so honestly.

### B2. Cookies and analytics

- **No law requires a cookie banner.** Israel has no ePrivacy-style cookie statute. The PPA has
  no dedicated cookie guidance; I found none on gov.il. DataGuidance agrees that "there is no
  equivalent legislation"
  ([DataGuidance, May 2026](https://www.dataguidance.com/notes/israel-cookies-similar-technologies),
  secondary).
- **The PPA consent opinion (25.02.2026) governs**
  ([gov.il](https://www.gov.il/he/pages/consent-2026)). According to secondary summaries citing
  its paragraph numbers ([Schwebel](https://schwebel-law.com/writing/privacy-policy-cookies-israel),
  [PrivacyCheck](https://privacycheck.co.il/guides/is-cookie-banner-mandatory); I have not
  verified the numbers myself):
  - **para 42:** continued browsing *after the required information was shown on entry* will
    usually be implied consent, when collection is reasonably connected to the service;
  - **paras 48 and 74:** profiling not needed for the service, and direct mail, require separate
    active opt-in.

  The gov.il summary itself confirms opt-in for unrelated profiling where there is a power
  imbalance.
- **No analytics.** No cookies, no tracking and no third-party scripts. There is then no consent
  question, and the privacy note only has to say so. This is the cleanest option.
- **Cookieless analytics** (e.g. self-hosted or privacy-focused counters):
  - visitors' IP and user-agent still reach the analytics provider. After Amendment 13, IP
    addresses and other "online identifiers" fall within "personal information";
  - so disclose the tool, its provider and its location in the privacy note;
  - avoid tools whose provider uses the data for its own purposes or for advertising, since that
    is profiling and needs opt-in;
  - a provider abroad raises the transfer question in B3;
  - a banner is not legally required for purely aggregate, non-identifying counting.
- **Avoid Google Analytics and advertising pixels.** They involve profiling by a third party,
  which the PPA says needs opt-in.

### B3. GitHub Pages: IP logging and cross-border transfer

- **What GitHub collects.** GitHub states: "When a GitHub Pages site is visited, the visitor's
  IP address is logged and stored for security purposes, regardless of whether the visitor has
  signed into GitHub or not"
  ([GitHub Docs: What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)).
  GitHub's privacy statement (effective 27 Apr 2026) describes GitHub as data controller for its
  own processing, collecting IP address, device data and pages viewed
  ([GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)).
- **Is disclosure required?** Not strictly, as far as I can tell:
  - s.11 is triggered when someone *asks a person for* data, and the lab asks visitors for
    nothing;
  - GitHub collects the IP addresses for its own security purposes.

  It is still a "SHOULD": a one-line disclosure costs nothing, matches the Technion policy's
  description of automatic collection, and anticipates the PPA's "informed" standard. My
  interpretation; no specific rule found.
- **Transfer-abroad regulations** (Privacy Protection (Transfer of Data to Databases Abroad)
  Regulations, 5761-2001) ([text, Nevo](https://www.nevo.co.il/law_html/law00/71639.htm);
  [PPA FAQ, updated 14.01.2026](https://www.gov.il/he/pages/information_transfer_fqa)):
  - **reg. 1:** no transfer from a database in Israel abroad unless the destination's law gives
    protection not lower than Israel's;
  - **reg. 2** gives alternatives, including (1) **the data subject's consent**, (4) a
    contractual undertaking to Israeli-equivalent conditions, which the PPA interpreted in its
    opinion of 09.04.2026 ([PPA](https://www.gov.il/he/pages/infoabroad)), and (8) a country
    that is party to Convention 108, or that receives EU data on the same terms;
  - **reg. 3:** *in addition*, a written undertaking by the recipient to protect the data and
    not pass it on (the PPA FAQ says reg. 3 is cumulative);
  - the regulations apply even if the database need not be registered (PPA FAQ).
- **How this applies to Atlas.** The member data published on the site, and stored in the
  repository, sits on GitHub's US-based infrastructure.
  - **Recommended basis: reg. 2(1) consent.** Put it in the member consent form ("the site is
    hosted by GitHub, Inc. in the USA").
  - **Possible alternative: 2(8)(2).** GitHub is certified under the EU-U.S. Data Privacy
    Framework, active until 08/03/2027 ([DPF listing](https://www.dataprivacyframework.gov/participant/6174);
    [GitHub statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)).
    Not verified whether the PPA accepts DPF certification under 2(8)(2).
  - **Reg. 3 is open.** For free organisations, GitHub's Terms and Privacy Statement are likely
    the only "written undertaking"; a GitHub DPA is offered to its paid customers.
  - **Not a lab-level decision.** The Technion's policy says its transfers abroad follow the 2001
    regulations under DPAs ([Technion privacy policy](https://www.technion.ac.il/en/privacy-policy/)).
    Ask the DPO.

### B4. The Technion privacy policy and the lab notice

**What the Technion policy covers.** The policy (last updated 1 Sep 2025, per the page) states
it covers "users of **all its websites**" ([Technion privacy policy](https://www.technion.ac.il/en/privacy-policy/)).
It names:
- the Technion as database controller (sysaid@technion.ac.il);
- a DPO (dpo@technion.ac.il);
- automatic collection, including cookies and third-party analytics;
- transfers abroad under the 2001 regulations;
- rights of inspection and correction through the DPO.

It does not list sub-sites or mention GitHub. A lab site under `technion.ac.il` is therefore
nominally covered, but the policy describes processing (forms, payments, cookies) the lab does not
do.

**What a short lab "Privacy" page should say** (my synthesis of the sources above):
1. The Technion is the controller. Link to the Technion privacy policy and give the DPO address.
2. The site sets no cookies and uses no analytics or third-party trackers, or name the
   cookieless tool if one is used.
3. The site is hosted by GitHub Pages (GitHub, Inc., USA), which logs visitors' IP addresses for
   security ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)).
   Link to GitHub's privacy statement.
4. Member profiles are published with each member's consent. Members may ask to correct or
   remove their information, and the page should give the lab contact and the expected
   turnaround. Note that the history of the public repository may retain earlier versions.
5. External links (ORCID, DBLP, publishers) have their own policies; the Technion policy contains
   the same caveat.
6. The date of the last update.

---

## C. Security and Technion IT

### C1. Technion and CS policy for sites under `technion.ac.il`

**Technion Information Security Procedure 09-0301** (edition 3, updated 20.11.24)
([PDF](https://trdf.technion.ac.il/wp-content/uploads/2024/11/Information-security-procedure-20.11.24.pdf)):
- **s.4.1.2–4.1.3.** Department heads bear overall responsibility and designate an "Information
  Security Trustee".
- **s.5.3.** Incidents are reported to **ciso@technion.ac.il**.
- **s.5.5.** "At the beginning of any process involving the development of new services … or
  changes to existing services in the field of information services, **the Technion's CISO must
  be involved**."

  This is the closest thing to an approval requirement. It is general and not website-specific.

**Hosting rules for Technion-hosted sites** (they do not cover GitHub Pages directly):
- On the CIS dedicated server, "the site will undergo security checks and comply with the rules
  of accessibility and privacy before launching"
  ([CIS Web Development](https://cis.technion.ac.il/en/services/web-development/)).
- On the web3cloud server, applications must follow CIS security policy, go through a **CISO
  security check before being opened outside the Technion network**, and are re-checked after
  further development ([web3cloud terms](https://cis.technion.ac.il/services/web-development/website-hosting-form-web3/)).
- CIS lists a procedure titled "response to a security incident on a website", but its text is
  not public ([CIS work procedures](https://cis.technion.ac.il/work-procedures/)).

**DNS and certificates.**
- Contacts: dns@technion.ac.il for DNS and cert@technion.ac.il for SSL certificates
  ([CIS important emails](https://cis.technion.ac.il/local/important-emails/)). The CIO, CISO and
  DPO are listed on the [CIS contact page](https://cis.technion.ac.il/contact-us/).
- I found no written Technion or CS-faculty policy on pointing subdomains at external hosts.
- **Precedent, checked 17 Nov 2026:** `tdk.cs.technion.ac.il` is a CNAME to
  `techniontdk.github.io` and is served by `Server: GitHub.com`. CS IT already permits this
  pattern in practice.
- **HTTPS (checked by me):** `https://technion.ac.il/` returns
  `Strict-Transport-Security: max-age=16070400; includeSubDomains`.
  - A browser that has seen this header will refuse plain HTTP, and will not let the user
    bypass certificate errors, on **any** `*.technion.ac.il` host, including
    `atlas.cs.technion.ac.il`.
  - So the site must have a valid certificate before the CNAME goes live, or be switched over
    quickly. Turn on "Enforce HTTPS" in GitHub
    ([GitHub Docs: HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)).
  - I found no written Technion rule requiring HTTPS; the HSTS header makes it mandatory in
    practice.
- **CAA (checked through the Technion resolver; the external view was not checked):**
  - `technion.ac.il` has CAA `issue` entries for harica.gr, digicert.com, sectigo.com and
    **letsencrypt.org**, plus `iodef mailto:dns@technion.ac.il`;
  - `cs.technion.ac.il` has no CAA, so it inherits the parent's;
  - GitHub Pages obtains certificates from Let's Encrypt
    ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)),
    so no CAA change is needed.
- **Subdomain takeover.** GitHub recommends verifying the custom domain with a TXT record
  (`_github-pages-challenge-<org>.<domain>`) and keeping it in place. It warns against wildcard
  DNS records ([GitHub Docs: verifying your custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)).
  When the site is retired, have IT remove the CNAME *before* deleting the repository or the
  Pages site.

### C2. Israel National Cyber Directorate guidance for small sites

No INCD regulation binds a university lab website. The relevant guidance:

- **"Recommendations for businesses and website owners: preventing defacement"** (04.03.2026)
  ([gov.il](https://www.gov.il/he/pages/web040326)):
  - keep the CMS, plugins and themes updated;
  - use strong unique passwords and **2FA** on admin accounts;
  - limit admin access and remove unused accounts;
  - use a WAF;
  - **back up off-server**;
  - check file permissions;
  - monitor for anomalies;
  - report incidents to the **119** hotline.

  For a GitHub-hosted static site these become: 2FA on the GitHub org; few admins; branch
  protection; and the Git repository plus an off-GitHub clone serving as the backup.
- **WordPress defacement alert** (10.06.2026): dozens of sites defaced through a shared
  WordPress, PHP, Nginx and MySQL stack ([gov.il](https://www.gov.il/he/pages/alert_2000)). A
  static site removes that attack surface.
- **CERT-IL "preparing for website defacement"** (21 May 2020) recommends ([copy hosted by the
  Manufacturers' Association](https://www.industry.org.il/files/cyber/har2405.pdf); secondary
  host of an INCD document):
  - periodic, tested backups, at least one offline;
  - a **prepared fallback page**;
  - agreeing in advance with the hosting provider who does what;
  - not restoring until the attack vector is fixed.
- **INCD recommendations before #OpIsrael** (Mar 2019), section 1.3 on domain names
  ([copy](https://industry.org.il/files/hightech/file/%D7%94%D7%9E%D7%9C%D7%A6%D7%95%D7%AA%2020019.pdf);
  secondary host):
  - alert on DNS changes and lock the registrar record;
  - review DNS records periodically.

  This is Technion DNS-team territory.
- **The INCD Cyber Defense Methodology** (2021 version) is organisation-wide, so the Technion
  CISO handles it ([gov.il](https://www.gov.il/he/pages/cyber_security_methodology_for_organizations)).

---

## Unverified points and open questions

1. **Whether IS 5568 sets a language for the statement.** I could not read the guidelines on
   accessibility statements that reg. 35ה refers to (paid or not located). No Hebrew-language
   requirement was found.
2. **Where "accessible platform" ends.** It is undefined beyond the 2016 Knesset discussion. It is
   unclear whether alt text and heading structure count as "platform" or "content". Recommendation:
   meet AA everywhere.
3. **The commencement date for lab sites:** 14.11.2016 (hangasha, Bar-Ilan) against 30.11.2018
   (CIS KB). It does not matter for a 2026 site.
4. **Whether lab members' own papers are "third-party content"** under reg. 35ב. Probably not.
5. **The truncated CIS KB sentence** on statements for non-accessible sites; the page is behind a
   login.
6. **The PPA consent opinion's paragraph numbers (42, 48, 74)** come from secondary summaries.
   The gov.il summary confirms the substance on opt-in.
7. **Whether the Technion is a para (1) public body** that has to register databases. It is a
   Technion-level matter.
8. **Whether DPF certification satisfies reg. 2(8)(2), and what counts as GitHub's reg. 3
   "written undertaking"** for a free organisation. Ask the Technion DPO.
9. **The fine amount.** hangasha says NIS 60,000; the statute is indexed. I did not check the
   current amount.
10. **The CAA records** were resolved through the Technion internal DNS; a split-horizon view is
    possible. Re-check from outside before launch.
11. **The Technion privacy-policy date** shows as "Last Updated Sep. 1, 2025" in one fetch. A
    second fetch reported no explicit date, only a 2025/09 PDF path.

---

## Requirements summary

| Requirement | Status | Source |
|---|---|---|
| Templates, navigation and components ("platform") meet IS 5568-1:2023 (WCAG 2.0 AA plus national changes: 2.4.10 required; 1.2.4, 1.2.5 and 3.1.2 not) | **MUST** | HEI regs 6(a)(3) ([Reshumot 7727](https://olaw.org.il/takanot/takanot-7727.pdf)); reg. 35א ([regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)); [IS 5568-1](https://www.gov.il/BlobFolder/legalinfo/israeli_accessibility_standards_pdf/he/sitedocs_si-5568-1-september-2023.pdf) |
| Content (text, images, PDFs, video) accessible | **MUST on request, within 60 days** of a visitor's demand; SHOULD from the start | HEI reg 6(a)(3); [hangasha exclusion page](https://hangasha.net.technion.ac.il/%d7%94%d7%97%d7%a8%d7%92%d7%aa-%d7%90%d7%aa%d7%a8%d7%99%d7%9d-%d7%a9%d7%9c-%d7%97%d7%91%d7%a8%d7%99-%d7%a1%d7%92%d7%9c-%d7%95%d7%9e%d7%a2%d7%91%d7%93%d7%95%d7%aa/) |
| Course or teaching material on the site | **MUST** be fully accessible (lab relief does not apply), or host it elsewhere | HEI reg 6(a)(3) |
| Target WCAG 2.2 AA | SHOULD (not legally required) | [SII page](https://www.sii.org.il/he/lobby/standardization/standard-page?id=6751); [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| Accessibility statement in a prominent place: adjustments, coordinator details, contact for reports or demands, exemptions | **MUST** | reg. 35ה, 35ו(ג) ([regs](https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf)) |
| Statement also gives last-updated date, standard and level, AT and browsers tested, known limits; at least two routes to it | SHOULD (Commission guidance) | [Commission guide](https://www.gov.il/he/pages/declaration_website_accessibility?chapterIndex=2); [FAQ](https://www.gov.il/he/pages/website_accessibility_faq) |
| Link to the Technion institutional statement, and to campus physical-accessibility info | **MUST** (Technion rule) | [CIS KB](https://cis.technion.ac.il/kb/faq/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%90%D7%AA%D7%A8%D7%99%D7%9D/web-accessibility/%D7%9E%D7%94%D7%99-%D7%94%D7%A6%D7%94%D7%A8%D7%AA-%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA/); [hangasha](https://hangasha.net.technion.ac.il/category/accessibility-updates/) |
| Statement in Hebrew | Not required (none found); SHOULD link to the Hebrew Technion statement | [Technion HE statement](https://www.technion.ac.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/) |
| Overlay or toolbar widget | **Not required**; SHOULD NOT rely on one | [Commission FAQ](https://www.gov.il/he/pages/website_accessibility_faq) |
| Small-business, foreign-language or "part of larger institution" exemptions | **Not applicable** | [guide ch. 8](https://www.gov.il/he/pages/website_accessibility?chapterIndex=8); [FAQ](https://www.gov.il/he/pages/website_accessibility_faq) |
| Documented, voluntary consent before publishing a member's photo, phone or bio; honour withdrawal | **MUST** (in practice) | s.1, s.2(9) ([Wikisource](https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%92%D7%A0%D7%AA_%D7%94%D7%A4%D7%A8%D7%98%D7%99%D7%95%D7%AA)); [PPA consent opinion](https://www.gov.il/he/pages/consent-2026) |
| s.11 notice when collecting member details (voluntary?, purpose, controller, recipients, rights) | **MUST** | s.11 as amended ([Reshumot 3287](https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf)) |
| Correct or delete inaccurate member data on request | **MUST** | s.13–14 |
| Database registration or notification by the lab | **Not applicable** (Technion-level) | s.8א; [PPA Q&A](https://www.gov.il/he/pages/tikun13_qa) |
| Cookie banner | **Not applicable** with no cookies or analytics; opt-in if any profiling | [PPA consent opinion](https://www.gov.il/he/pages/consent-2026) |
| Privacy page: Technion controller and DPO, no cookies, GitHub hosting and IP logging, removal contact | SHOULD | [Technion policy](https://www.technion.ac.il/en/privacy-policy/); [GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) |
| Lawful basis for US hosting of member data (consent clause; confirm with DPO) | **MUST** | [Transfer regs 1–3](https://www.nevo.co.il/law_html/law00/71639.htm); [PPA FAQ](https://www.gov.il/he/pages/information_transfer_fqa) |
| Involve the Technion CISO (and CS IT) before launch | **MUST** | [Procedure 09-0301 s.5.5](https://trdf.technion.ac.il/wp-content/uploads/2024/11/Information-security-procedure-20.11.24.pdf) |
| Valid HTTPS from day one; Enforce HTTPS | **MUST** (in effect: HSTS `includeSubDomains` on technion.ac.il) | Header I checked; [GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) |
| CAA permits Let's Encrypt | Already satisfied | Technion DNS (I checked) |
| GitHub domain verification TXT; no wildcard; remove CNAME on retirement | SHOULD | [GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) |
| 2FA, least privilege, off-GitHub backup, fallback page, DNS change monitoring | SHOULD | [INCD 04.03.2026](https://www.gov.il/he/pages/web040326); [CERT-IL 2020](https://www.industry.org.il/files/cyber/har2405.pdf) |
| Report security incidents to ciso@technion.ac.il (INCD 119 as well) | **MUST** (Technion) / SHOULD | [Procedure 09-0301 s.5.3](https://trdf.technion.ac.il/wp-content/uploads/2024/11/Information-security-procedure-20.11.24.pdf); [INCD](https://www.gov.il/he/pages/web040326) |
