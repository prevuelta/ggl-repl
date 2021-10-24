import sharp from 'sharp';

export default  (thumbPath, svg) => {
  return sharp(Buffer.from(svg)).png().toFile(thumbPath);
}
