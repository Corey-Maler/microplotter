export class Color {
  constructor(public r: number, public g: number, public b: number, public a = 1) {

  }

  toString(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  opaque(alpha: number): Color {
    return new Color(this.r, this.g, this.b, this.a * alpha);
  }

  static fromHex(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) throw new Error('Invalid hex color');
    return new Color(
      Number.parseInt(result[1], 16),
      Number.parseInt(result[2], 16),
      Number.parseInt(result[3], 16)
    );
  }

  static fromRgb(r: number, g: number, b: number): Color {
    return new Color(r, g, b);
  }
}

export const Colors ={
  red: new Color(255, 0, 0),
  orange: new Color(255, 165, 0),
  yellow: new Color(255, 255, 0),
}
