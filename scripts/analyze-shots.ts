/** Analyze QA screenshots with the same pixel statistics as the visual tests. */
import { readFileSync } from 'node:fs';
import { analyzeBuffer, regionStd } from '../tests/visual/pixels';

const files = ['qa-showroom.png', 'qa-bed.png', 'qa-library.png', 'qa-editor.png'];
for (const f of files) {
  const buf = readFileSync(`tests/.artifacts/${f}`);
  const s = analyzeBuffer(buf);
  const floor = regionStd(buf, Math.floor(s.width * 0.35), Math.floor(s.height * 0.72), Math.floor(s.width * 0.65), Math.floor(s.height * 0.92));
  console.log(
    `${f}: ${s.width}x${s.height} meanLuma=${s.meanLuma.toFixed(1)} std=${s.stdLuma.toFixed(1)} ` +
    `black=${s.blackRatio.toFixed(3)} white=${s.whiteRatio.toFixed(3)} colors=${s.colorDiversity} floorStd=${floor.toFixed(2)}`,
  );
}
