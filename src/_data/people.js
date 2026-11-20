// The Lab's people, as the People page and the Profile pages show them.
// Members and Alumni live in <content set>/members/; this loads and groups them.
import { ALUMNUS_ROLE, MEMBER_ROLES, loadMembers } from '../../lib/content.js';

// The heading of each role group on the People page.
const GROUP_TITLES = {
  'Lab Director': 'Lab Director',
  'Postdoctoral Researcher': 'Postdoctoral Researchers',
  'PhD Student': 'PhD Students',
  'MSc Student': 'MSc Students',
  'Research Staff': 'Research Staff',
};

// The letters of an initials avatar: the first letters of the first and last
// words of a name, skipping a title such as "Prof." or "Dr.".
function initials(name) {
  const words = name.split(/\s+/).filter((word) => word && !word.endsWith('.'));
  const letters = [words[0], words.length > 1 ? words.at(-1) : ''].map((word) => [...(word ?? '')][0] ?? '');
  return letters.join('').toUpperCase();
}

export default () => {
  const everyone = loadMembers().map((member) => ({ ...member, initials: initials(member.name) }));
  const members = everyone.filter((member) => member.role !== ALUMNUS_ROLE);
  return {
    // Current Members: each gets a card and a Profile page.
    members,
    // One group per role somebody holds, in the roles' fixed order.
    groups: MEMBER_ROLES
      .map((role) => ({
        id: role.toLowerCase().replaceAll(' ', '-'),
        title: GROUP_TITLES[role],
        lead: role === 'Lab Director',
        members: members.filter((member) => member.role === role),
      }))
      .filter((group) => group.members.length),
    alumni: everyone.filter((member) => member.role === ALUMNUS_ROLE),
  };
};
