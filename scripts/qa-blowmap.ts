import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const png = PNG.sync.read(readFileSync(file));
const COLS = 70, ROWS = 24;
for (let r = 0; r < ROWS; r++) {
  let line = '';
  for (let c = 0; c < COLS; c++) {
    let over = 0, n = 0;
    for (let dy = -5; dy <= 5; dy += 3) {
      for (let dx = -5; dx <= 5; dx += 3) {
        const x = Math.min(png.width - 1, Math.max(0, Math.floor(((c + 0.5) / COLS) * png.width) + dx));
        const y = Math.min(png.height - 1, Math.max(0, Math.floor(((r + 0.5) / ROWS) * png.height) + dy));
        const i = (y * png.width + x) * 4;
        const l = 0.2126 * png.data[i]! + 0.7152 * png.data[i + 1]! + 0.0722 * png.data[i + 2]!;
        if (l > 245) over++;
        n++;
      }
    }
    line += over / n > 0.5 ? '#' : over / n > 0.15 ? '.' : ' ';
  }
  console.log(line);
}
