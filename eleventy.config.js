// The generator: turns the content set (content/ by default) into _site/.
//
// Only src/ is template input, so repo docs and agent files (CLAUDE.md, README,
// GLOSSARY, docs/, .claude/) can never be published.
import { contentDir, describeErrors, validateContent } from './lib/content.js';
import { writePhotos } from './lib/photos.js';

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget(contentDir());

  // The logo, styles and script, published as-is under /assets/.
  eleventyConfig.addPassthroughCopy('src/assets');

  // Every build validates first; invalid content never reaches _site/. Then
  // it writes the photos, figures and logos, resized and stripped of metadata; content/
  // is not template input, so a picture as committed is never published.
  eleventyConfig.on('eleventy.before', async ({ directories }) => {
    const errors = validateContent();
    if (errors.length) {
      const error = new Error(describeErrors(errors));
      error.skipOriginalStack = true; // the messages say all there is to say
      throw error;
    }
    await writePhotos(directories.output);
  });

  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
  };
}
