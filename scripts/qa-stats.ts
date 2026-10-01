import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const png = PNG.sync.read(readFileSync(file));
let sum = 0, n = 0, over = 0, under = 0;
for (let y = 0; y < png.height; y += 4) {
  for (let x = 0; x < png.width; x += 4) {
    const i = (y * png.width + x) * 4;
    const l = 0.2126 * png.data[i]! + 0.7152 * png.data[i + 1]! + 0.0722 * png.data[i + 2]!;
    sum += l; n++;
    if (l > 245) over++;
    if (l < 20) under++;
  }
}
console.log(`${file.split('/').pop()}: mean=${(sum / n).toFixed(1)} blown(>245)=${(100 * over / n).toFixed(1)}% crushed(<20)=${(100 * under / n).toFixed(1)}%`);
