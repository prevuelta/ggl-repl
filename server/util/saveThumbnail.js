import sharp from 'sharp';

export default function saveThumbnail(thumbPath, svg) {
  console.log('Saving thumbnail', svg);
  return sharp(Buffer.from(svg))
    .png()
    .toFile(thumbPath);
}
