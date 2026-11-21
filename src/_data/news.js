// The Lab's News, as the News page and the Profile pages show it. News items
// live in <content set>/news/; this loads them, newest first.
import { TALK_TYPE, loadMembers, loadNews } from '../../lib/content.js';

// A date as a visitor reads it: 2025-03-14 is "14 March 2025". UTC, so the
// day is the one written whatever the time zone of the machine that builds.
const inWords = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default () => {
  // Newest first, as loaded.
  const items = loadNews().map((item) => ({
    ...item,
    dateText: inWords.format(new Date(`${item.date}T00:00:00Z`)),
    talk: item.type === TALK_TYPE,
  }));
  return {
    items,
    // Person's slug -> the News items related to them, for a Member's Profile.
    byMember: Object.fromEntries(loadMembers().map(({ slug }) =>
      [slug, items.filter((item) => item.members?.includes(slug))])),
  };
};
