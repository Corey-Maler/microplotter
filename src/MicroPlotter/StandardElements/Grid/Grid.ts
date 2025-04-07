import { V2 } from "@/Math";
import { MPElement } from "../../render/MPElement";
import { CanvasRenderer } from "../../render/CanvasRenderer";
import { Colors } from "../../render/colors";
import { getAdaptiveGrid } from "./getAdaptiveGrid";

export class Grid extends MPElement {
  /**
   * Controls the density of the grid:
   * - 0: Standard grid density (default)
   * - 1: Higher level of detail with finer grid lines
   */
  public density: number = 0;

  constructor(density: number = 0) {
    super();
    this.density = density;
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
