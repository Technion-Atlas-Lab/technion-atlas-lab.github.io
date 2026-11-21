// Pictures from the content set: Members' and Alumni's photos and Publications'
// figures. The build publishes each one resized and with no embedded metadata
// (camera, author, location), never as it was committed.
// Used by eleventy.config.js to write the pictures, and by src/_data/people.js
// and src/_data/research.js to point pages at them.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { loadMembers, loadPublications, repoPath } from './content.js';

// Pixel widths served: a picture is drawn at most about 20rem wide, so 400
// covers ordinary screens and 800 dense ones.
const WIDTHS = [400, 800];
const PHOTOS_PATH = '/photos';
const FIGURES_PATH = '/figures';

const pictureUrl = (folder, slug, width) => `${folder}/${slug}-${width}.webp`;

// The `src` and `srcset` an <img> needs to show a picture written under `folder`.
const sources = (folder, slug) => ({
  src: pictureUrl(folder, slug, WIDTHS[0]),
  srcset: WIDTHS.map((width) => `${pictureUrl(folder, slug, width)} ${width}w`).join(', '),
});

// What an <img> needs to show the photo of the person with this slug.
export function photoSources(slug) {
  return { ...sources(PHOTOS_PATH, slug), size: WIDTHS.at(-1) };
}

// What an <img> needs to show the figure of the Publication with this slug,
// committed as `file`: a figure keeps its shape, so its height is read from it.
export async function figureSources(slug, file) {
  const { autoOrient } = await sharp(file).metadata().catch(unreadable(file, 'figure'));
  const width = WIDTHS.at(-1);
  return { ...sources(FIGURES_PATH, slug), width, height: Math.round(width * autoOrient.height / autoOrient.width) };
}

// Writes every photo a Member or an Alumnus has, and every figure a Publication
// has, into the built site at `outputDir`.
export async function writePhotos(outputDir) {
  const pictures = [
    ...loadMembers().filter((person) => person.photoFile).map((person) => ({
      file: person.photoFile,
      folder: PHOTOS_PATH,
      slug: person.slug,
      what: `photo of ${person.name}`,
      // Square, keeping the part of the picture that draws the eye (a face).
      resize: (width) => [width, width, { fit: 'cover', position: sharp.strategy.attention }],
    })),
    ...loadPublications().filter((publication) => publication.figureFile).map((publication) => ({
      file: publication.figureFile,
      folder: FIGURES_PATH,
      slug: publication.slug,
      what: 'figure',
      // Whole, in its own shape: cropping a figure could cut off what it shows.
      resize: (width) => [width],
    })),
  ];
  for (const folder of new Set(pictures.map((picture) => picture.folder))) {
    fs.mkdirSync(path.join(outputDir, folder), { recursive: true });
  }
  await Promise.all(pictures.flatMap(({ file, folder, slug, what, resize }) => WIDTHS.map((width) =>
    sharp(file)
      // Turn the picture upright first: the orientation note is metadata too, and goes.
      .rotate()
      .resize(...resize(width))
      // sharp writes no metadata unless asked to keep it.
      .webp({ quality: 82 })
      .toFile(path.join(outputDir, pictureUrl(folder, slug, width)))
      .catch(unreadable(file, what)))));
}

// Only reading the file shows that it is not a picture, so validation cannot say this.
const unreadable = (file, what) => (cause) => {
  const error = new Error(`${repoPath(file)}: the ${what} cannot be read as an image (${cause.message})`);
  error.skipOriginalStack = true;
  throw error;
};
