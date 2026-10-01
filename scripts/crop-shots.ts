/** Crop regions of a QA screenshot for close VLM inspection. */
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('tests/.artifacts/qa-showroom.png');
const png = PNG.sync.read(src);
const { width: W, height: H } = png;

function crop(x0: number, y0: number, x1: number, y1: number, out: string, scale = 2): void {
  const w = x1 - x0;
  const h = y1 - y0;
  const dst = new PNG({ width: w * scale, height: h * scale });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y0 + y) * W + (x0 + x);
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const di = ((y * scale + dy) * (w * scale) + (x * scale + dx));
          dst.data[di * 4] = png.data[si * 4];
          dst.data[di * 4 + 1] = png.data[si * 4 + 1];
          dst.data[di * 4 + 2] = png.data[si * 4 + 2];
          dst.data[di * 4 + 3] = 255;
        }
      }
    }
  }
  writeFileSync(out, PNG.sync.write(dst));
  console.log('wrote', out, `${w * scale}x${h * scale}`);
}

// right half of the viewport (the "right wall" with black lines), upper 2/3
crop(Math.floor(W * 0.5), Math.floor(H * 0.05), Math.floor(W * 0.98), Math.floor(H * 0.6), 'tests/.artifacts/crop-right-wall.png');
// center of the room (furniture area)
crop(Math.floor(W * 0.3), Math.floor(H * 0.3), Math.floor(W * 0.7), Math.floor(H * 0.75), 'tests/.artifacts/crop-center.png');
