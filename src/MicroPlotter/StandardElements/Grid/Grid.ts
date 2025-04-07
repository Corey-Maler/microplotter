import { V2 } from "@/Math";
import { MPElement } from "../../render/MPElement";
import { CanvasRenderer } from "../../render/CanvasRenderer";
import { Colors } from "../../render/colors";
import { getAdaptiveGrid } from "./getAdaptiveGrid";

/**
 * Grid rendering mode
 */
export enum GridMode {
  LINES,
  DOTS
}

export class Grid extends MPElement {
  /**
   * Controls the density of the grid:
   * - 0: Standard grid density (default)
   * - 1: Higher level of detail with finer grid lines
   */
  public density: number = 0;
  
  /**
   * Determines how the grid is rendered (lines or dots)
   */
  public mode: GridMode = GridMode.LINES;

  constructor(density: number = 0, mode: GridMode = GridMode.LINES) {
    super();
    this.density = density;
    this.mode = mode;
  }

  public render(renderer: CanvasRenderer) {
    const v = renderer.visibleArea;

    // Use the refactored getAdaptiveGrid function to generate synchronized grid lines
    // Pass the density parameter for grid detail control
    const gridResult = getAdaptiveGrid(
      v.bottomLeft.x, 
      v.topRight.x, 
      v.bottomLeft.y, 
      v.topRight.y,
      this.density
    );
    
    // Extract grid lines and opacity
    const gridX = gridResult.x;
    const gridY = gridResult.y;
    const subgridOpacity = gridResult.subgridOpacity;

    if (this.mode === GridMode.LINES) {
      this.renderLines(renderer, gridX, gridY, subgridOpacity);
    } else {
      this.renderDots(renderer, gridX, gridY, subgridOpacity);
    }
  }

  private renderLines(
    renderer: CanvasRenderer, 
    gridX: { grid: number[]; subgrid: number[] }, 
    gridY: { grid: number[]; subgrid: number[] }, 
    subgridOpacity: number
  ) {
    const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(subgridOpacity));
    
    const v = renderer.visibleArea;
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

  private renderDots(
    renderer: CanvasRenderer, 
    gridX: { grid: number[]; subgrid: number[] }, 
    gridY: { grid: number[]; subgrid: number[] }, 
    subgridOpacity: number
  ) {
    // Draw minor grid intersection points as dots
    const minorColor = Colors.grid.secondary(subgridOpacity);
    renderer.ll.fillStyle = minorColor;
    
    for (const x of gridX.subgrid) {
      for (const y of gridY.subgrid) {
        renderer.ll.beginPath();
        renderer.ll.arc(new V2(x, y), 1);
        renderer.ll.fill();
      }
      
      // Intersections of minor x with major y
      for (const y of gridY.grid) {
        renderer.ll.beginPath();
        renderer.ll.arc(new V2(x, y), 1);
        renderer.ll.fill();
      }
    }
    
    // Intersections of major x with minor y
    for (const x of gridX.grid) {
      for (const y of gridY.subgrid) {
        renderer.ll.beginPath();
        renderer.ll.arc(new V2(x, y), 1);
        renderer.ll.fill();
      }
    }
    
    // Draw major grid intersection points as dots
    const majorColor = Colors.grid.primary;
    renderer.ll.fillStyle = majorColor;
    
    for (const x of gridX.grid) {
      for (const y of gridY.grid) {
        renderer.ll.beginPath();
        renderer.ll.arc(new V2(x, y), 2);
        renderer.ll.fill();
      }
    }
  }
}
