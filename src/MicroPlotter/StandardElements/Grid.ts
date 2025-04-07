import { V2 } from "@/Math";
import { MPElement } from "../render/MPElement";
import { CanvasRenderer } from "../render/CanvasRenderer";
import { Colors } from "../render/colors";

/* grid which is aligned to the meters */
function getMeterGrid(min: number, max: number, targetLines = 10): { major: number[], minor: number[], zoomFactor: number } {
    const EARTH_CIRCUMFERENCE = 40_075_017; // in meters
    const rangeMeters = (max - min) * EARTH_CIRCUMFERENCE;

    // Compute base step in meters
    const baseStepMeters = Math.pow(10, Math.floor(Math.log10(rangeMeters / targetLines)));

    // Choose best step: 1, 2, or 5 multiples of base step
    const stepMeters = [baseStepMeters, baseStepMeters * 2, baseStepMeters * 5].find(s => rangeMeters / s > targetLines / 2) || baseStepMeters;

    // Minor grid step (e.g., divide major step by 5)
    const minorStepMeters = stepMeters / 5;

    // Convert to viewport units
    const meterToViewport = 1 / EARTH_CIRCUMFERENCE;
    const step = stepMeters * meterToViewport;
    const minorStep = minorStepMeters * meterToViewport;

    // Compute major grid lines
    const majorStart = Math.ceil(min / step) * step;
    const majorEnd = Math.floor(max / step) * step;
    const majorLines: number[] = [];
    for (let i = majorStart; i <= majorEnd; i += step) {
        majorLines.push(i);
    }

    // Compute minor grid lines
    const minorStart = Math.ceil(min / minorStep) * minorStep;
    const minorEnd = Math.floor(max / minorStep) * minorStep;
    const minorLines: number[] = [];

    const zoomFactor = Math.min(1, (targetLines * 2) / (rangeMeters / minorStepMeters));

    for (let i = minorStart; i <= minorEnd; i += minorStep) {
        if (!majorLines.includes(i)) {
            minorLines.push(i);
        }
    }

    return { major: majorLines, minor: minorLines, zoomFactor };
}
/* */

function getAdaptiveGrid(from: number, to: number): {
    major: number[],
    minor: number[],
    subMinor: number[],
    minorOpacity: number,
    subMinorOpacity: number
} {
    const range = to - from;
    const targetMajorLines = 5;

    const base = Math.pow(10, Math.floor(Math.log10(range / targetMajorLines)));
    const steps = [1, 2, 5].map(x => x * base);

    let majorStep = steps[0];
    for (const step of steps) {
        if (range / step >= targetMajorLines) {
            majorStep = step;
        } else {
            break;
        }
    }

    const minorStep = majorStep / 5;
    const subMinorStep = minorStep / 5;

    const major: number[] = [];
    const majorStart = Math.ceil(from / majorStep) * majorStep;
    const majorEnd = Math.floor(to / majorStep) * majorStep;
    for (let x = majorStart; x <= majorEnd + 1e-10; x += majorStep) {
        major.push(Number(x.toFixed(12)));
    }

    const minor: number[] = [];
    const minorStart = Math.ceil(from / minorStep) * minorStep;
    const minorEnd = Math.floor(to / minorStep) * minorStep;
    for (let x = minorStart; x <= minorEnd + 1e-10; x += minorStep) {
        const val = Number(x.toFixed(12));
        if (!major.includes(val)) {
            minor.push(val);
        }
    }

    const subMinor: number[] = [];
    const subMinorStart = Math.ceil(from / subMinorStep) * subMinorStep;
    const subMinorEnd = Math.floor(to / subMinorStep) * subMinorStep;
    for (let x = subMinorStart; x <= subMinorEnd + 1e-10; x += subMinorStep) {
        const val = Number(x.toFixed(12));
        if (!major.includes(val) && !minor.includes(val)) {
            subMinor.push(val);
        }
    }

    // New fade logic: fade in minor between [majorStep * 10, majorStep * 2]
    const fade = (start: number, end: number) =>
        Math.min(1, Math.max(0, (start - range) / (start - end)));

    const minorOpacity = fade(majorStep * 10, majorStep * 2); // fades in as you zoom in
    const subMinorOpacity = fade(minorStep * 10, minorStep * 2); // same idea

    return { major, minor, subMinor, minorOpacity, subMinorOpacity };
}

function getAdaptiveGrid2(min: number, max: number, targetLines = 8): { major: number[], minor: number[] } {
    const range = max - min;
    const baseStep = Math.pow(10, Math.floor(Math.log10(range / targetLines)));

    // Choose a step that aligns with round numbers
    const step = [baseStep, baseStep * 2, baseStep * 5].find(s => range / s > targetLines / 2) || baseStep;

    // Minor grid step (finer subdivisions)
    const minorStep = step / 5;

    // Compute major grid lines
    const majorStart = Math.ceil(min / step) * step;
    const majorEnd = Math.floor(max / step) * step;
    const majorLines: number[] = [];
    for (let i = majorStart; i <= majorEnd; i += step) {
        majorLines.push(i);
    }

    // Compute minor grid lines
    const minorStart = Math.ceil(min / minorStep) * minorStep;
    const minorEnd = Math.floor(max / minorStep) * minorStep;
    const minorLines: number[] = [];
    for (let i = minorStart; i <= minorEnd; i += minorStep) {
        // Avoid duplicating major grid lines
        if (!majorLines.includes(i)) {
            minorLines.push(i);
        }
    }

    return { major: majorLines, minor: minorLines };
}

export class Grid extends MPElement {
  /*
  constructor(private renderer: CanvasRenderer) {

  }
  */

  public render(renderer: CanvasRenderer) {

    const v = renderer.visibleArea;

    const gridX = getAdaptiveGrid(v.bottomLeft.x, v.topRight.x)
    console.log({
      from: v.bottomLeft.x,
      to: v.topRight.x,
    ...gridX
    })
    // const gridX = getMeterGrid(v.bottomLeft.x, v.topRight.x, 6)
    const gridY = getAdaptiveGrid(v.bottomLeft.y, v.topRight.y)
    // const gridY = getMeterGrid(v.bottomLeft.y, v.topRight.y, 6)

    const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(gridX.minorOpacity));
    console.log('zoom factor', gridX.minorOpacity, gridX.subMinorOpacity)
    // const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(1));

    const x0 = v.bottomLeft.x;
    const y0 = v.bottomLeft.y;
    const x1 = v.topRight.x;
    const y1 = v.topRight.y;

    for (const x of gridX.minor) {
      line(new V2(x, y0), new V2(x, y1))
    }

    for (const y of gridY.minor) {
      line(new V2(x0, y), new V2(x1, y));
    }

    stroke();

    renew(Colors.grid.primary);


    for (const x of gridX.major) {
      line(new V2(x, y0), new V2(x, y1))
    }

    for (const y of gridY.major) {
      line(new V2(x0, y), new V2(x1, y))
    }

    stroke();
  }
}
