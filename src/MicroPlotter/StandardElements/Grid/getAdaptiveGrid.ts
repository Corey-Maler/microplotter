/**
 * Generates adaptive grid and subgrid lines for a given range.
 * 
 * @param from - The starting value of the range
 * @param to - The ending value of the range
 * @returns Object containing grid and subgrid lines with their opacity values
 */
export function getAdaptiveGrid(from: number, to: number): {
  grid: number[];
  subgrid: number[];
  subgridOpacity: number;
} {
  // Calculate the range
  const range = to - from;
  
  // Get the magnitude of the range on a log10 scale
  const magnitude = Math.log10(range);
  
  // Calculate grid steps based on the magnitude
  const majorMagnitude = Math.floor(magnitude);
  const majorStep = Math.pow(10, majorMagnitude);
  const minorStep = majorStep / 10;
  
  // Determine how far we are through the current zoom level
  const zoomProgress = 1 - (magnitude - majorMagnitude);
  
  // Calculate opacity - we want opacity to start at 0 when we've just zoomed in
  // and increase to 1 as we continue to zoom in
  // This creates a natural fading effect as grid lines become more relevant
  const subgridOpacity = Math.max(0, Math.min(1, zoomProgress));
  
  // Generate main grid lines (major grid)
  const grid: number[] = [];
  const firstMajorLine = Math.ceil(from / majorStep) * majorStep;
  for (let i = firstMajorLine; i <= to; i += majorStep) {
    grid.push(Number(i.toFixed(10)));
  }
  
  // Generate subgrid lines (minor grid)
  const subgrid: number[] = [];
  const firstMinorLine = Math.ceil(from / minorStep) * minorStep;
  for (let i = firstMinorLine; i <= to; i += minorStep) {
    // Skip if this line is already in the main grid
    if (Math.abs(i % majorStep) < minorStep / 100) continue;
    subgrid.push(Number(i.toFixed(10)));
  }
  
  // Log relevant info for debugging
  console.log({
    range,
    magnitude,
    majorStep,
    minorStep,
    zoomProgress,
    subgridOpacity
  });
  
  return {
    grid,
    subgrid,
    subgridOpacity,
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
