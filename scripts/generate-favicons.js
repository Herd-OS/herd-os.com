import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const sourceImage = join(publicDir, 'logo.png');

async function generateFavicons() {
  // Generate apple-touch-icon.png (180x180)
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png (180x180)');

  // Generate favicon.ico as a proper ICO container wrapping a 32x32 PNG
  const pngBuffer = await sharp(sourceImage)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Build ICO file: 6-byte header + 16-byte directory entry + PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: 1 = ICO
  header.writeUInt16LE(1, 4);      // Number of images

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);         // Width (32; 0 would mean 256)
  entry.writeUInt8(32, 1);         // Height
  entry.writeUInt8(0, 2);          // Color palette count (0 = no palette)
  entry.writeUInt8(0, 3);          // Reserved
  entry.writeUInt16LE(1, 4);       // Color planes
  entry.writeUInt16LE(32, 6);      // Bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);   // Image size in bytes
  entry.writeUInt32LE(6 + 16, 12);            // Offset to image data

  const ico = Buffer.concat([header, entry, pngBuffer]);
  const { writeFile } = await import('fs/promises');
  await writeFile(join(publicDir, 'favicon.ico'), ico);
  console.log('Created favicon.ico (32x32 ICO container with PNG)');
}

generateFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});
