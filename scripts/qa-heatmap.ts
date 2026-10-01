/** Floor luminance heatmap — ASCII grid over the screenshot to find light pools. */
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? '/home/z/my-project/scripts/shots-v2/02-editor-golden.png';
const png = PNG.sync.read(readFileSync(file));
// sample region: floor area (full width, lower 2/3)
const x0 = Math.floor(png.width * 0.1), x1 = Math.floor(png.width * 0.9);
const y0 = Math.floor(png.height * 0.45), y1 = Math.floor(png.height * 0.92);
const COLS = 64, ROWS = 26;
const chars = ' .:-=+*#%@';

let mn = 255, mx = 0;
const grid: number[][] = [];
for (let r = 0; r < ROWS; r++) {
  const row: number[] = [];
  for (let c = 0; c < COLS; c++) {
    const xa = x0 + Math.floor(((c + 0.5) / COLS) * (x1 - x0));
    const ya = y0 + Math.floor(((r + 0.5) / ROWS) * (y1 - y0));
    let sum = 0, n = 0;
    for (let dy = -4; dy <= 4; dy += 2) {
      for (let dx = -4; dx <= 4; dx += 2) {
        const x = Math.min(png.width - 1, Math.max(0, xa + dx));
        const y = Math.min(png.height - 1, Math.max(0, ya + dy));
        const i = (y * png.width + x) * 4;
        sum += 0.2126 * png.data[i]! + 0.7152 * png.data[i + 1]! + 0.0722 * png.data[i + 2]!;
        n++;
      }
    }
    const l = sum / n;
    row.push(l);
    if (l < mn) mn = l;
    if (l > mx) mx = l;
  }
  grid.push(row);
}

console.log(`file: ${file}`);
console.log(`floor region luminance min=${mn.toFixed(0)} max=${mx.toFixed(0)} (delta=${(mx - mn).toFixed(0)})`);
console.log('heatmap (dark → bright):');
for (const row of grid) {
  let line = '';
  for (const l of row) {
    const t = (l - mn) / Math.max(1, mx - mn);
    line += chars[Math.min(9, Math.floor(t * 9.99))];
  }
  console.log(line);
}
