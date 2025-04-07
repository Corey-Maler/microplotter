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

    renderer.webGL

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
    // Adjust opacity mapping: 
    // Map original opacity range [0, 0.5] to 0
    // Map original opacity range [0.5, 1] to [0, 1] linearly
    const adjustedOpacity = subgridOpacity <= 0.5 ? 0 : (subgridOpacity - 0.5) * 2;
    
    // Skip rendering subgrid if opacity is too low
    if (adjustedOpacity < 0.1) {
      // Only render major grid points
      const majorPoints: number[] = [];
      for (const x of gridX.grid) {
        for (const y of gridY.grid) {
          majorPoints.push(x, y);
        }
      }
      
      // Use consistent 2-pixel size for all dots
      const dotSize = 2;
      const majorColor = '#c9c9ca'; // Grid primary color
      
      // Render all major points with the grid color
      if (majorPoints.length > 0) {
        renderer.webGL.renderPoints(
          new Float32Array(majorPoints), 
          majorColor, 
          dotSize
        );
      }
      
      return;
    }
    
    // Continue with normal rendering since opacity is sufficient
    const webglLL = renderer.webGL;
    
    // Create a Set of major grid points for quick lookup
    const majorPointsSet = new Set<string>();
    
    // Collect major grid intersection points as dots
    const majorPoints: number[] = [];
    for (const x of gridX.grid) {
      for (const y of gridY.grid) {
        // Create a unique key for this point
        const key = `${x},${y}`;
        majorPointsSet.add(key);
        majorPoints.push(x, y);
      }
    }
    
    // Prepare arrays to hold the filtered subgrid point data
    const minorPoints: number[] = [];
    
    // Collect minor grid intersection points as dots (subgrid x subgrid)
    for (const x of gridX.subgrid) {
      for (const y of gridY.subgrid) {
        // Skip if this point is already in the major grid
        const key = `${x},${y}`;
        if (!majorPointsSet.has(key)) {
          minorPoints.push(x, y);
        }
      }
    }
    
    // Intersections of minor x with major y
    for (const x of gridX.subgrid) {
      for (const y of gridY.grid) {
        // Skip if this point is already in the major grid
        const key = `${x},${y}`;
        if (!majorPointsSet.has(key)) {
          minorPoints.push(x, y);
        }
      }
    }
    
    // Intersections of major x with minor y
    for (const x of gridX.grid) {
      for (const y of gridY.subgrid) {
        // Skip if this point is already in the major grid
        const key = `${x},${y}`;
        if (!majorPointsSet.has(key)) {
          minorPoints.push(x, y);
        }
      }
    }
    
    // Use consistent 2-pixel size for all dots
    const dotSize = 2;
    
    // Use rgba format explicitly to ensure proper handling of opacity
    const minorColor = `rgba(221, 221, 221, ${adjustedOpacity})`;
    const majorColor = '#dddddd'; // Grid primary color
    
    // Render all minor points with the subgrid color
    if (minorPoints.length > 0) {
      webglLL.renderPoints(
        new Float32Array(minorPoints), 
        minorColor, 
        dotSize
      );
    }
    
    // Render all major points with the grid color (after minors to ensure they're on top)
    if (majorPoints.length > 0) {
      webglLL.renderPoints(
        new Float32Array(majorPoints), 
        majorColor, 
        dotSize
      );
    }
  }
}

