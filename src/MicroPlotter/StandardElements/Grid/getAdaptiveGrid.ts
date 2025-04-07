/**
 * Generates synchronized adaptive grid lines for both X and Y axes.
 * 
 * @param fromX - The starting X value
 * @param toX - The ending X value
 * @param fromY - The starting Y value
 * @param toY - The ending Y value
 * @param density - Controls grid density: 0 for standard, 1 for higher detail (default: 0)
 * @returns Object containing grid and subgrid lines with their opacity values for both axes
 */
export function getAdaptiveGrid(
  fromX: number, 
  toX: number, 
  fromY: number, 
  toY: number, 
  density: number = 0
): {
  x: { grid: number[]; subgrid: number[] };
  y: { grid: number[]; subgrid: number[] };
  subgridOpacity: number;
} {
  // Calculate ranges for both axes
  const rangeX = toX - fromX;
  const rangeY = toY - fromY;
  
  // Use the smaller range to determine grid steps for both axes
  // This ensures grid resolution is synchronized between X and Y
  const minRange = Math.min(rangeX, rangeY);
  
  // Use the same magnitude for both axes to ensure synchronization
  // Apply density offset to show more detailed grid when density is higher
  const magnitudeOffset = density > 0 ? 1 : 0;
  const magnitude = Math.floor(Math.log10(minRange)) - magnitudeOffset;
  const majorStep = Math.pow(10, magnitude);
  const minorStep = majorStep / 10;
  
  // Calculate aligned starting positions for gridlines
  // This ensures grid lines are positioned at "nice" numbers like 0, 10, 20, etc.
  const xStart = Math.floor(fromX / majorStep) * majorStep;
  const yStart = Math.floor(fromY / majorStep) * majorStep;
  
  // Calculate the opacity based on zoom level (same for both axes)
  const magnitude_exact = Math.log10(minRange);
  // Adjust zoom progress calculation to account for density offset
  const zoomProgress = 1 - ((magnitude_exact - magnitude) - magnitudeOffset);
  const subgridOpacity = Math.max(0, Math.min(1, zoomProgress));
  
  // Generate grid lines for X axis
  const gridX: number[] = [];
  const subgridX: number[] = [];
  
  // Generate grid lines for Y axis
  const gridY: number[] = [];
  const subgridY: number[] = [];
  
  // Generate major grid lines for X axis
  for (let i = xStart; i <= toX + majorStep; i += majorStep) {
    gridX.push(i);
  }
  
  // Generate major grid lines for Y axis
  for (let i = yStart; i <= toY + majorStep; i += majorStep) {
    gridY.push(i);
  }
  
  // Generate minor grid lines for X axis
  const xMinorStart = Math.floor(fromX / minorStep) * minorStep;
  for (let i = xMinorStart; i <= toX + minorStep; i += minorStep) {
    // Skip if this line is already in the main grid
    if (Math.abs(i % majorStep) < minorStep / 100) continue;
    subgridX.push(i);
  }
  
  // Generate minor grid lines for Y axis
  const yMinorStart = Math.floor(fromY / minorStep) * minorStep;
  for (let i = yMinorStart; i <= toY + minorStep; i += minorStep) {
    // Skip if this line is already in the main grid
    if (Math.abs(i % majorStep) < minorStep / 100) continue;
    subgridY.push(i);
  }
  
  return {
    x: {
      grid: gridX,
      subgrid: subgridX
    },
    y: {
      grid: gridY,
      subgrid: subgridY
    },
    subgridOpacity
  };
}

/**
 * Calculates a "nice" step size for a specific magnitude.
 * 
 * @param magnitude - The magnitude to calculate a nice step for
 * @returns A nice step size
 */
function calculateNiceStepForMagnitude(magnitude: number): number {
  // Base step is 1.0 multiplied by 10^magnitude
  return Math.pow(10, magnitude);
}

/**
 * Calculates a "nice" step size for the grid based on the range.
 * A nice number is one that is aesthetically pleasing as tick mark intervals.
 * 
 * @param range - The range to calculate a nice step for
 * @returns A nice step size
 */
function calculateNiceStep(range: number): number {
  // Get the magnitude of the range
  const magnitude = Math.floor(Math.log10(range));
  const normalizedRange = range / Math.pow(10, magnitude);
  
  // Choose a nice step size
  let step: number;
  if (normalizedRange < 1.5) {
    step = 0.1; // 0.1, 0.2, ...
  } else if (normalizedRange < 3) {
    step = 0.2; // 0.2, 0.4, ...
  } else if (normalizedRange < 7) {
    step = 0.5; // 0.5, 1.0, ...
  } else {
    step = 1.0; // 1, 2, ...
  }
  
  // Scale the step back to the original range magnitude
  return step * Math.pow(10, magnitude);
}
