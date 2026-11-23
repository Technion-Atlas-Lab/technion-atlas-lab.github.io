// The Lab's Partners, as the "Collaborating with" page shows them. Partners
// live in <content set>/partners/; this loads them, in name order.
import { loadPartners } from '../../lib/content.js';
import { logoSources } from '../../lib/photos.js';

export default () => Promise.all(loadPartners().map(async ({ logoFile, ...partner }) => ({
  ...partner,
  // The logo as the build publishes it; nothing for a Partner shown by name.
  logo: logoFile ? await logoSources(partner.slug, logoFile) : null,
})));
