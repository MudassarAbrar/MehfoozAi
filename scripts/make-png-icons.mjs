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
  // Weather-themed icon: Sky-blue gradient bg + white cloud + yellow sun + blue raindrops
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);
  const cx = width / 2;
  const cy = height / 2;
  const safeZone = isMaskable ? 0.8 : 1.0; // Maskable: content within 80% safe zone
  const scale = (width / 512) * safeZone;
  const offX = isMaskable ? width * 0.1 : 0;
  const offY = isMaskable ? height * 0.1 : 0;

  // Cloud circles (in 512-space, then scaled)
  const clouds = [
    { x: 210, y: 260, r: 64 },
    { x: 280, y: 240, r: 72 },
    { x: 340, y: 268, r: 52 },
    { x: 210, y: 310, r: 30 },
    { x: 250, y: 310, r: 30 },
    { x: 290, y: 310, r: 30 },
    { x: 330, y: 310, r: 30 },
    { x: 370, y: 310, r: 26 },
  ];
  const sun = { x: 320, y: 176, r: 72, rInner: 56 };
  const drops = [
    { x: 220, y: 370 },
    { x: 270, y: 390 },
    { x: 320, y: 374 },
  ];

  for (let py = 0; py < height; py++) {
    const rowOffset = py * stride;
    raw[rowOffset] = 0; // Filter None

    for (let px = 0; px < width; px++) {
      const idx = rowOffset + 1 + px * 4;

      // Map to 512-space
      const sx = (px - offX) / scale;
      const sy = (py - offY) / scale;

      // Outside safe zone → transparent for maskable
      if (isMaskable && (sx < 0 || sx > 512 || sy < 0 || sy > 512)) {
        raw[idx] = 0; raw[idx + 1] = 0; raw[idx + 2] = 0; raw[idx + 3] = 0;
        continue;
      }

      // Background: sky-blue gradient (top lighter, bottom deeper)
      const t = Math.max(0, Math.min(1, (sy || py / height) / 512));
      let r = Math.round(107 + (74 - 107) * t);  // #6BB5F0 → #4A90D9
      let g = Math.round(181 + (144 - 181) * t);
      let b = Math.round(240 + (217 - 240) * t);

      // Sun
      const sdx = sx - sun.x;
      const sdy = sy - sun.y;
      const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sdist <= sun.r) {
        const sunT = sdist / sun.r;
        r = Math.round(255 + (255 - 255) * sunT);
        g = Math.round(217 + (224 - 217) * (1 - sunT));
        b = Math.round(61 + (102 - 61) * (1 - sunT));
      }

      // Cloud (white)
      let inCloud = false;
      for (const c of clouds) {
        const cdx = sx - c.x;
        const cdy = sy - c.y;
        if (Math.sqrt(cdx * cdx + cdy * cdy) <= c.r) {
          inCloud = true;
          break;
        }
      }
      if (inCloud) {
        r = 255; g = 255; b = 255;
      }

      // Raindrops (light blue)
      for (const d of drops) {
        const ddx = sx - d.x;
        const ddy = sy - d.y;
        const rx = 6, ry = 14;
        if ((ddx * ddx) / (rx * rx) + (ddy * ddy) / (ry * ry) <= 1) {
          r = 184; g = 216; b = 248;
        }
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
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

console.log('Weather-themed PWA icons generated successfully.');
