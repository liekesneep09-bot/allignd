import sharp from 'sharp';

async function run() {
  const input = 'public/wep-app-logo-allignd.png';
  
  await sharp(input)
    .resize(180, 180)
    .withMetadata(false)
    .toColorspace('srgb')
    .toFile('public/apple-touch-icon-v6.png');
    
  await sharp(input)
    .resize(192, 192)
    .withMetadata(false)
    .toColorspace('srgb')
    .toFile('public/logo-192-v4.png');
    
  await sharp(input)
    .resize(512, 512)
    .withMetadata(false)
    .toColorspace('srgb')
    .toFile('public/logo-512-v4.png');

  await sharp(input)
    .resize(64, 64)
    .withMetadata(false)
    .toColorspace('srgb')
    .toFile('public/favicon-v4.png');
}

run().catch(console.error);
