import { V2 } from '@/Math';
import type { CanvasRenderer } from '../../render/CanvasRenderer';
import { MPElement } from '../../render/MPElement';
import { Colors } from '../../render/colors';
import { getAdaptiveGrid } from './getAdaptiveGrid';

/**
 * Grid rendering mode
 */
export enum GridMode {
  LINES = 0,
  DOTS = 1,
}

export class Grid extends MPElement {
  /**
   * Controls the density of the grid:
   * - 0: Standard grid density (default)
   * - 1: Higher level of detail with finer grid lines
   */
  public density = 0;

  /**
   * Determines how the grid is rendered (lines or dots)
   */
  public mode: GridMode = GridMode.LINES;

  constructor(density = 0, mode: GridMode = GridMode.LINES) {
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
      this.density,
    );

    // Extract grid lines and opacity
    const gridX = gridResult.x;
    const gridY = gridResult.y;
    const subgridOpacity = gridResult.subgridOpacity;

    if (this.mode === GridMode.LINES) {
      this.renderLines(renderer, gridX, gridY, subgridOpacity);
    } else {
      // Use the GPU-based shader rendering for dots
      renderer.webGL.renderGridDots(
        v,
        this.density,
        '#dddddd', // Grid primary color
        subgridOpacity,
        2, // Dot size
      );
    }
  }

  private renderLines(
    renderer: CanvasRenderer,
    gridX: { grid: number[]; subgrid: number[] },
    gridY: { grid: number[]; subgrid: number[] },
    subgridOpacity: number,
  ) {
    const { line, stroke, renew } = renderer.batch(
      Colors.grid.secondary(subgridOpacity),
    );

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
}
