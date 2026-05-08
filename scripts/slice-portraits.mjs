import sharp from 'sharp';
import { mkdir, copyFile } from 'fs/promises';
import path from 'path';

const CELL = 418;
const OUTPUT_SIZE = 96;

const CLANS = [
  ['ventrue',   'toreador', 'malkavian'],
  ['nosferatu', 'brujah',   'tremere'],
  ['gangrel',   'lasombra', 'silhouette'],
];

async function sliceSheet(inputPath, assetDir, publicDir) {
  await mkdir(assetDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const name = CLANS[row][col];
      const outPath = path.join(assetDir, `${name}.png`);
      await sharp(inputPath)
        .extract({ left: col * CELL, top: row * CELL, width: CELL, height: CELL })
        .resize(OUTPUT_SIZE, OUTPUT_SIZE)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      await copyFile(outPath, path.join(publicDir, `${name}.png`));
      console.log(`  ${name}.png`);
    }
  }
}

console.log('Slicing modern sheet...');
await sliceSheet(
  'assets/portraits/portrait-pc-modern.png',
  'assets/portraits/modern',
  'public/characters/modern'
);

console.log('Slicing medieval sheet...');
await sliceSheet(
  'assets/portraits/portrait-pc-medieval.png',
  'assets/portraits/medieval',
  'public/characters/medieval'
);

console.log('Done.');
