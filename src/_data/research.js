// The Lab's research, as the Research page and the Profile pages show it.
// Research Areas live in <content set>/research-areas/ and Publications in
// <content set>/publications/; this loads them and joins them to the people.
import { PREPRINT_STATUS, itemsByMember, loadMembersBySlug, namedPerson, loadPublications, loadResearchAreas } from '../../lib/content.js';
import { figureSources } from '../../lib/photos.js';

// A DOI as a web address. A DOI may hold characters such as # and ?, which
// would cut the address short if left as written.
const doiUrl = (doi) => `https://doi.org/${doi.split('/').map(encodeURIComponent).join('/')}`;

// A card's links, in the order shown. A DOI and a paper link both lead to the
// Publication itself; validation allows only one of them.
const links = (publication) => [
  { label: 'Paper', url: publication.doi ? doiUrl(publication.doi) : publication.paper },
  { label: 'PDF', url: publication.pdf },
  { label: 'arXiv', url: publication.arxiv },
  { label: 'Code', url: publication.code },
  { label: 'Video', url: publication.video },
].filter((link) => link.url);

export default async () => {
  const people = loadMembersBySlug();
  const areas = loadResearchAreas();
  const areaOf = new Map(areas.map((area) => [area.slug, area]));

  // An author is a name, or names a person's file.
  const author = (entry) => typeof entry === 'string' ? { name: entry } : namedPerson(people.get(entry.member));

  // Newest first, as loaded.
  const publications = await Promise.all(loadPublications().map(async ({ figureFile, ...publication }) => ({
    ...publication,
    authors: publication.authors.map(author),
    area: areaOf.get(publication.research_area),
    preprint: publication.status === PREPRINT_STATUS,
    links: links(publication),
    figure: figureFile
      ? { ...await figureSources(publication.slug, figureFile), alt: publication.figure_alt }
      : null,
  })));

  return {
    // Every Research Area in its set order, each with its Publications.
    areas: areas.map((area) => ({
      ...area,
      publications: publications.filter((publication) => publication.area === area),
    })),
    // Member's slug -> that Member's Publications, for their Profile.
    byMember: itemsByMember(people, publications, (publication, slug) => publication.authors.some((a) => a.profile === slug)),
  };
};
