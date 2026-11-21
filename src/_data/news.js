// The Lab's News, as the News page and the Profile pages show it. News items
// live in <content set>/news/; this loads them, newest first.
import { TALK_TYPE, calendarDay, itemsByMember, loadMembersBySlug, loadNews, namedPerson } from '../../lib/content.js';

// A date as a visitor reads it: 2025-03-14 is "14 March 2025". UTC, as
// calendarDay gives the day in UTC.
const dateInWords = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default () => {
  const everyone = loadMembersBySlug();
  // Newest first, as loaded.
  const items = loadNews().map((item) => ({
    ...item,
    // The related Members, in the order the item gives them.
    people: (item.members ?? []).map((slug) => namedPerson(everyone.get(slug))),
    dateText: dateInWords.format(calendarDay(item.date)),
    talk: item.type === TALK_TYPE,
  }));
  return {
    items,
    // Member's slug -> the News items related to them, for their Profile.
    byMember: itemsByMember(everyone, items, (item, slug) => item.members?.includes(slug)),
  };
};
