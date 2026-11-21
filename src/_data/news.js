// The Lab's News, as the News page and the Profile pages show it. News items
// live in <content set>/news/; this loads them, newest first.
import { TALK_TYPE, calendarDay, itemsByMember, loadMembersBySlug, loadNews, namedPerson } from '../../lib/content.js';

// A date as a visitor reads it: 2025-03-14 is "14 March 2025". UTC, as
// calendarDay gives the day in UTC.
const dateInWords = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default () => {
  const everyone = loadMembersBySlug();
  // Newest first, as loaded.
  // An item's file gives its related Members as file names (`members`). Here
  // the item gets them twice, in the order given, each under a name that says
  // what it holds: `memberSlugs`, the file names, and `relatedMembers`, the
  // names to show and the Profiles to link them to.
  const items = loadNews().map(({ members: memberSlugs = [], ...item }) => ({
    ...item,
    memberSlugs,
    relatedMembers: memberSlugs.map((slug) => namedPerson(everyone.get(slug))),
    dateText: dateInWords.format(calendarDay(item.date)),
    talk: item.type === TALK_TYPE,
  }));
  return {
    items,
    // Member's slug -> the News items related to them, for their Profile.
    byMember: itemsByMember(everyone, items, (item, slug) => item.memberSlugs.includes(slug)),
  };
};
