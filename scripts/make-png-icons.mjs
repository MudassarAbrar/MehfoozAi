import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcVal = crc32(typeAndData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  // Coral #FC7454: R: 252, G: 116, B: 84
  // Shield white: R: 255, G: 255, B: 255
  // Neutral dark #1C2C34: R: 28, G: 44, B: 52
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width * (isMaskable ? 0.42 : 0.46);
  const innerRadius = width * (isMaskable ? 0.32 : 0.36);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    raw[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background Coral (#FC7454) with subtle radial gradient
      let r = 252;
      let g = 116;
      let b = 84;
      let a = 255;

      // Shield region
      const inShieldX = Math.abs(dx) <= innerRadius * 0.85;
      const inShieldY = dy >= -innerRadius * 0.8 && dy <= innerRadius * 0.95;
      const shieldTaper = (dy > 0) ? (1 - (dy / (innerRadius * 1.1))) : 1;
      
      if (inShieldY && Math.abs(dx) <= innerRadius * 0.85 * Math.max(0.2, shieldTaper)) {
        // Inner shield surface: Clean white / teal-tinted
        r = 246;
        g = 250;
        b = 250;

        // Emblem in center: Scales and Heart
        // Vertical axis
        if (Math.abs(dx) <= innerRadius * 0.08 && dy >= -innerRadius * 0.45 && dy <= innerRadius * 0.3) {
          r = 28; g = 44; b = 52; // #1C2C34
        }
        // Horizontal bar
        if (Math.abs(dy - (-innerRadius * 0.2)) <= innerRadius * 0.06 && Math.abs(dx) <= innerRadius * 0.6) {
          r = 28; g = 44; b = 52;
        }
        // Scale pans
        if ((Math.abs(dx - (-innerRadius * 0.45)) <= innerRadius * 0.18 || Math.abs(dx - (innerRadius * 0.45)) <= innerRadius * 0.18) && 
            dy >= -innerRadius * 0.05 && dy <= innerRadius * 0.15) {
          r = 252; g = 116; b = 84; // Coral pan
        }
        // Center heart dot
        if (dist <= innerRadius * 0.16 && dy >= innerRadius * 0.35 && dy <= innerRadius * 0.65) {
          r = 252; g = 116; b = 84; // Coral heart
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // Bit depth: 8
  ihdrData.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // Compression method: 0
  ihdrData.writeUInt8(0, 11); // Filter method: 0
  ihdrData.writeUInt8(0, 12); // Interlace method: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT (zlib deflated)
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(32, 32, false));

console.log('Successfully generated all PWA icon assets in public/ directory.');
