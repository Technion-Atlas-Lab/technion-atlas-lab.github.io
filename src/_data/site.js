// Site settings live in <content set>/site.yaml; this only loads them.
import { loadSiteSettings } from '../../lib/content.js';

export default () => loadSiteSettings();
