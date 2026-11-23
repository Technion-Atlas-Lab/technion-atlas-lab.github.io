// The Lab's Student Projects, as the Projects page and the Profile pages show
// them. Student Projects live in <content set>/student-projects/; this loads
// them and joins them to their supervisors and Research Areas.
import { COMPLETED_STATUS, itemsByMember, loadMembersBySlug, loadResearchAreas, loadStudentProjects, namedPerson } from '../../lib/content.js';

// A card's links, in the order shown.
const links = (project) => [
  { label: 'Report', url: project.report },
  { label: 'Code', url: project.code },
  { label: 'Video', url: project.video },
].filter((link) => link.url);

export default () => {
  const everyone = loadMembersBySlug();
  const areaOf = new Map(loadResearchAreas().map((area) => [area.slug, area]));
  // Offered first, then Completed, as loaded.
  // A project's file gives its supervisors as file names. Here the project
  // gets them twice, in the order given: `supervisorSlugs`, the file names,
  // and `supervisors`, the names to show and the Profiles to link them to.
  const all = loadStudentProjects().map(({ supervisors: supervisorSlugs, ...project }) => ({
    ...project,
    supervisorSlugs,
    supervisors: supervisorSlugs.map((slug) => namedPerson(everyone.get(slug))),
    students: project.students ?? [],
    area: areaOf.get(project.research_area),
    completed: project.status === COMPLETED_STATUS,
    links: links(project),
  }));
  return {
    offered: all.filter((project) => !project.completed),
    completed: all.filter((project) => project.completed),
    // Member's slug -> the Student Projects they supervise, for their Profile.
    byMember: itemsByMember(everyone, all, (project, slug) => project.supervisorSlugs.includes(slug)),
  };
};
