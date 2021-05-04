import sharp from 'sharp';

export default function saveThumbnail(thumbPath, svg) {
  return sharp(Buffer.from(svg)).png().toFile(thumbPath);
}
