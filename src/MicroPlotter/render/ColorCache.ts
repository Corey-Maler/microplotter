export class ColorCache {
  private static instance: ColorCache;
  private cache: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): ColorCache {
    if (!ColorCache.instance) {
      ColorCache.instance = new ColorCache();
    }
    return ColorCache.instance;
  }

  getColor(color: string | undefined): number[] {
    if (!color) return [1, 1, 1, 1];
    
    // Check if color is already in cache
    if (this.cache.has(color)) {
      return this.cache.get(color)!;
    }

    // Parse and cache the color
    const parsedColor = this.parseColor(color);
    this.cache.set(color, parsedColor);
    return parsedColor;
  }

  private parseColor(color: string): number[] {
    const hex = color.replace('#', '');
    return [
      parseInt(hex.substr(0, 2), 16) / 255,
      parseInt(hex.substr(2, 2), 16) / 255,
      parseInt(hex.substr(4, 2), 16) / 255,
      1
    ];
  }
} 