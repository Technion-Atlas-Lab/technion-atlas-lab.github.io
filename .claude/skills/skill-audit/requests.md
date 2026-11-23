# Sample requests

One fixed request per content skill, the same every run so runs compare. Each holds the Maintainer's request, the Maintainer's answers to the questions the skill asks, and the **Expected** lines step 3 checks the result against.

The requests name files in `content/`. When a named file no longer exists (in the Content phase the placeholder people go), swap in a current one of the same kind and say so in the report. An answer for a question the skill does not ask goes unused.

## add-person

Setup, inside the runner's worktree before sending: write the photo the request names.

```bash
mkdir -p .builds/skill-audit && node -e "import('sharp').then(({ default: sharp }) => sharp({ create: { width: 600, height: 800, channels: 3, background: '#7ad3c5' } }).jpeg().toFile(process.argv[1]))" .builds/skill-audit/photo.jpg
```

Request (with the worktree's absolute path):

> Add Member Name Nine to the site as a PhD student. They gave Consent to publish their GitHub link (https://example.org/member-name-nine-code), their photo (`<worktree>/.builds/skill-audit/photo.jpg`) and this bio: "Member Name Nine studies placeholder topics in trustworthy machine learning." Their email is member.name.nine@example.org.

Answers:

- Consent for the email: "I can't confirm that."
- Order: "Yes, after the last one is right."
- File name: "member-name-nine is fine."
- Placeholder or real: "Placeholder."

Expected:

- `content/members/member-name-nine.md` holds `name`, `role: PhD Student`, `order` one above the highest PhD Student's, `photo`, `github` and the bio as its body, and opens with the placeholder comment. It holds no email.
- `content/members/member-name-nine.jpg` is beside it.
- `/people/` lists them last among the PhD Students; `/people/member-name-nine/` shows the photo, the GitHub link and the bio.

## add-news

Request:

> Please announce on the News page: Member Name Two and Member Name Six gave a talk, "Placeholder Attacks on Example Agents", at the Example Security Symposium in Haifa, together with Collaborator Name One from Example University. The slides are at https://example.org/slides/placeholder-attacks.

Answers:

- Date: "14 October 2026."
- Recording: "The recording is at https://example.org/video/placeholder-attacks."
- Placeholder or real: "Placeholder."

Expected:

- One new file in `content/news/`, opening with the placeholder comment: `type: talk`, `date: 2026-10-14`, `members` listing `member-name-two` then `member-name-six`, and the recording.
- The title is a headline naming the Example Security Symposium as well as the talk; the body names Collaborator Name One and neither related Member.
- The slides link is left out, and the report tells the Maintainer so.
- `/news/` shows the item with its Talk badge, "People: Member Name Two, Member Name Six" and the recording link; both Profiles show it.

## add-publication

Request:

> Add this paper. The preprint is at https://arxiv.org/abs/2601.99999 and here's the BibTeX. Code is at https://example.org/code/placeholder-shields.
> ```
> @inproceedings{placeholder2026shields,
>   title     = {Placeholder Shields: Example Defences for Example Agents},
>   author    = {Name One, Member and M. Name Three and Name One, Collaborator},
>   booktitle = {Proceedings of the Example Conference on Placeholder Security},
>   year      = {2026}
> }
> ```

Answers:

- Research Area: "research-area-two."
- Placeholder or real: "Placeholder."
- Whether M. Name Three is a Member: "Yes, that's Member Name Three."
- Featured, figure, PDF, video, summary: "None of those."
- The title, venue, year and status as written: "They're right."

Expected:

- The source is the BibTeX entry, saved as `.builds/add-publication/entry.bib`.
- One new file in `content/publications/`, opening with the placeholder comment, with authors `member: member-name-one`, `member: member-name-three` and `Collaborator Name One`, `research_area: research-area-two`, `status: published` and the code link. It holds no `arxiv` field: a placeholder leaves out the real arXiv address, and the report tells the Maintainer so.
- `/research/` shows it under Research Area Two; both Members' Profiles list it.

## move-to-alumni

Request:

> Member Name Two has graduated, please move them to the Alumni.

Answers:

- Year: the current year.
- Current position: "Research Scientist at Example Corp, and yes, they gave Consent to publish it."
- Placeholder or real: "Placeholder."

Expected:

- `content/members/member-name-two.md` stays at its path and holds only `name`, `role: Alumnus`, `order`, `former_role: PhD Student`, `year`, `current_position` and its `photo`, with no body.
- Its `order` puts it last among the Alumni of its year, and no two Alumni share a number.
- `git status --short` lists only files in `content/members/`.
- Every item step 1 listed still shows the name, unlinked; `/people/member-name-two/` is gone.
