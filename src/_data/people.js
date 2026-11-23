// The Lab's people, as the People page and the Profile pages show them.
// Members and Alumni live in <content set>/members/; this loads and groups them.
import { ALUMNUS_ROLE, MEMBER_ROLES, loadMembers, withoutTitle } from '../../lib/content.js';
import { photoSources } from '../../lib/photos.js';

// The Lab Director's group gets one wide card.
const LAB_DIRECTOR = 'Lab Director';

// The heading of each role group on the People page.
const GROUP_TITLES = {
  'Lab Director': 'Lab Director',
  'Postdoctoral Researcher': 'Postdoctoral Researchers',
  'PhD Student': 'PhD Students',
  'MSc Student': 'MSc Students',
  'Research Staff': 'Research Staff',
};

// The letters of an initials avatar: the first letters of the first and last
// words of a name, without a leading title such as "Prof." or "Dr.".
function initials(name) {
  const words = withoutTitle(name).split(' ');
  const letters = [words[0], words.length > 1 ? words.at(-1) : ''].map((word) => [...(word ?? '')][0] ?? '');
  return letters.join('').toUpperCase();
}

export default () => {
  // Each person's picture is their photo as the build publishes it, or their initials.
  const everyone = loadMembers().map(({ photoFile, ...person }) => ({
    ...person,
    initials: initials(person.name),
    picture: photoFile ? photoSources(person.slug) : null,
  }));
  const members = everyone.filter((person) => person.role !== ALUMNUS_ROLE);
  return {
    // Current Members: each gets a card and a Profile page.
    members,
    // One group per role somebody holds, in the roles' fixed order.
    groups: MEMBER_ROLES
      .map((role) => ({
        id: role.toLowerCase().replaceAll(' ', '-'),
        title: GROUP_TITLES[role],
        lead: role === LAB_DIRECTOR,
        members: members.filter((member) => member.role === role),
      }))
      .filter((group) => group.members.length),
    alumni: everyone.filter((person) => person.role === ALUMNUS_ROLE),
  };
};
