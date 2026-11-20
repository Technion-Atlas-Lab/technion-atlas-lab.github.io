// Photos of Members and Alumni: the build publishes each one resized, square and with no
// embedded metadata (camera, author, location), never as it was committed.
// Used by eleventy.config.js to write the photos and by src/_data/people.js to
// point pages at them.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { loadMembers, repoPath } from './content.js';

// Pixel widths served: a picture is at most 14rem wide, so 400 covers ordinary
// screens and 800 dense ones.
const WIDTHS = [400, 800];
const PHOTOS_PATH = '/photos';

const photoUrl = (slug, width) => `${PHOTOS_PATH}/${slug}-${width}.webp`;

// What an <img> needs to show the photo of the person with this slug.
export function photoSources(slug) {
  return {
    src: photoUrl(slug, WIDTHS[0]),
    srcset: WIDTHS.map((width) => `${photoUrl(slug, width)} ${width}w`).join(', '),
    size: WIDTHS.at(-1),
  };
}

// Writes every photo a Member or an Alumnus has into the built site at `outputDir`.
export async function writePhotos(outputDir) {
  const withPhoto = loadMembers().filter((person) => person.photoFile);
  if (withPhoto.length) fs.mkdirSync(path.join(outputDir, PHOTOS_PATH), { recursive: true });
  await Promise.all(withPhoto.flatMap((person) => WIDTHS.map((width) =>
    sharp(person.photoFile)
      // Turn the picture upright first: the orientation note is metadata too, and goes.
      .rotate()
      // Square, keeping the part of the picture that draws the eye (a face).
      .resize(width, width, { fit: 'cover', position: sharp.strategy.attention })
      // sharp writes no metadata unless asked to keep it.
      .webp({ quality: 82 })
      .toFile(path.join(outputDir, photoUrl(person.slug, width)))
      .catch((cause) => {
        // Only reading the file shows that it is not a picture, so validation cannot say this.
        const error = new Error(
          `${repoPath(person.photoFile)}: the photo of ${person.name} cannot be read as an image (${cause.message})`);
        error.skipOriginalStack = true;
        throw error;
      }))));
}
