// The generator: turns the content set (content/ by default) into _site/.
//
// Only src/ is template input, so repo docs and agent files (CLAUDE.md, README,
// GLOSSARY, docs/, .claude/) can never be published.
import { contentDir, describeErrors, validateContent } from './lib/content.js';

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget(contentDir());

  // Every build validates first; invalid content never reaches _site/.
  eleventyConfig.on('eleventy.before', () => {
    const errors = validateContent();
    if (errors.length) {
      const error = new Error(describeErrors(errors));
      error.skipOriginalStack = true; // the messages say all there is to say
      throw error;
    }
  });

  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
  };
}
