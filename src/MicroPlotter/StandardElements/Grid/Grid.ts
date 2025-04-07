import { V2 } from "@/Math";
import { MPElement } from "../../render/MPElement";
import { CanvasRenderer } from "../../render/CanvasRenderer";
import { Colors } from "../../render/colors";
import { getAdaptiveGrid } from "./getAdaptiveGrid";

export class Grid extends MPElement {
  /*
  constructor(private renderer: CanvasRenderer) {

  }
  */

  public render(renderer: CanvasRenderer) {
    const v = renderer.visibleArea;

    // Calculate range for both axes
    const rangeX = v.topRight.x - v.bottomLeft.x;
    const rangeY = v.topRight.y - v.bottomLeft.y;
    
    // Use the smaller range to determine grid steps for both axes
    // This ensures grid resolution is synchronized between X and Y
    const minRange = Math.min(rangeX, rangeY);
    
    // Use the same magnitude for both axes to ensure synchronization
    const magnitude = Math.floor(Math.log10(minRange));
    const majorStep = Math.pow(10, magnitude);
    const minorStep = majorStep / 10;
    
    // Calculate aligned starting positions for gridlines
    // This ensures grid lines are positioned at "nice" numbers like 0, 10, 20, etc.
    const xStart = Math.floor(v.bottomLeft.x / majorStep) * majorStep;
    const yStart = Math.floor(v.bottomLeft.y / majorStep) * majorStep;
    
    // Generate grid and subgrid lines for X axis with proper typing
    const gridX: {
      grid: number[];
      subgrid: number[];
      subgridOpacity: number;
    } = {
      grid: [],
      subgrid: [],
      subgridOpacity: 0
    };
    
    // Generate grid and subgrid lines for Y axis with proper typing
    const gridY: {
      grid: number[];
      subgrid: number[];
      subgridOpacity: number;
    } = {
      grid: [],
      subgrid: [],
      subgridOpacity: 0
    };
    
    // Calculate the opacity based on zoom level (same for both axes)
    const magnitude_exact = Math.log10(minRange);
    const zoomProgress = 1 - (magnitude_exact - magnitude);
    const subgridOpacity = Math.max(0, Math.min(1, zoomProgress));
    
    gridX.subgridOpacity = subgridOpacity;
    gridY.subgridOpacity = subgridOpacity;
    
    // Generate major grid lines for X and Y axes
    for (let i = xStart; i <= v.topRight.x + majorStep; i += majorStep) {
      gridX.grid.push(i);
    }
    
    for (let i = yStart; i <= v.topRight.y + majorStep; i += majorStep) {
      gridY.grid.push(i);
    }
    
    // Generate minor grid lines for X and Y axes
    const xMinorStart = Math.floor(v.bottomLeft.x / minorStep) * minorStep;
    const yMinorStart = Math.floor(v.bottomLeft.y / minorStep) * minorStep;
    
    for (let i = xMinorStart; i <= v.topRight.x + minorStep; i += minorStep) {
      // Skip if this line is already in the main grid
      if (Math.abs(i % majorStep) < minorStep / 100) continue;
      gridX.subgrid.push(i);
    }
    
    for (let i = yMinorStart; i <= v.topRight.y + minorStep; i += minorStep) {
      // Skip if this line is already in the main grid
      if (Math.abs(i % majorStep) < minorStep / 100) continue;
      gridY.subgrid.push(i);
    }
    
    console.log({
      rangeX,
      rangeY,
      minRange,
      magnitude,
      majorStep,
      minorStep,
      zoomProgress,
      subgridOpacity
    });

    const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(subgridOpacity));

    const x0 = v.bottomLeft.x;
    const y0 = v.bottomLeft.y;
    const x1 = v.topRight.x;
    const y1 = v.topRight.y;

    // Draw minor grid lines
    for (const x of gridX.subgrid) {
      line(new V2(x, y0), new V2(x, y1));
    }

    for (const y of gridY.subgrid) {
      line(new V2(x0, y), new V2(x1, y));
    }

    stroke();

    renew(Colors.grid.primary);

    // Draw major grid lines
    for (const x of gridX.grid) {
      line(new V2(x, y0), new V2(x, y1));
    }

    for (const y of gridY.grid) {
      line(new V2(x0, y), new V2(x1, y));
    }

    stroke();
  }
}
