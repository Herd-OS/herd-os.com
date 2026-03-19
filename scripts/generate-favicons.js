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

  // Generate favicon.ico as a 32x32 PNG (modern .ico is just a PNG)
  // Browsers accept PNG-in-ICO. We output a 32x32 PNG with .ico extension.
  await sharp(sourceImage)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico (32x32 PNG)');
}

generateFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});
