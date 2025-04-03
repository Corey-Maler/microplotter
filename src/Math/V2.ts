export class V2 {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(v: V2) {
    return new V2(this.x + v.x, this.y + v.y);
  }

  public sub(v: V2) {
    return new V2(this.x - v.x, this.y - v.y);
  }

  public mul(s: number) {
    return new V2(this.x * s, this.y * s);
  }

  public byElementDiv(v: V2) {
    return new V2(this.x / v.x, this.y / v.y);
  }

  public dot(v: V2) {
    return this.x * v.x + this.y * v.y;
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public floor() {
    return new V2(Math.floor(this.x), Math.floor(this.y));
  }

  public distanceTo(v2: V2) {
    const dx = this.x - v2.x;
    const dy = this.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public withinDistance(v2: V2, distance: number) {
    return this.distanceTo(v2) <= distance;
  }

  public static average(v1: V2, v2: V2) {
    return new V2((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
  }

  public static closestToLine(p: V2, a: V2, b: V2) {
    const ap = p.sub(a);
    const ab = b.sub(a);

    const t = ap.dot(ab) / ab.dot(ab);

    if (t < 0) {
      return a;
    }

    if (t > 1) {
      return b;
    }

    return a.add(ab.mul(t));
  }

  public clone() {
    return new V2(this.x, this.y);
  }

  public minFrom(p2: V2) {
    if (p2.x < this.x) {
      this.x = p2.x;
    }

    if (p2.y < this.y) {
      this.y = p2.y;
    }
  }

  public equals(p2: V2) {
    // exact equal
    return this.x === p2.x && this.y === p2.y;
  }

  public closeEnough(p2: V2, epsilon = 1e-20) {
    return Math.abs(this.x - p2.x) < epsilon && Math.abs(this.y - p2.y) < epsilon;
  }

  public maxFrom(p2: V2) {
    if (p2.x > this.x) {
      this.x = p2.x;
    }

    if (p2.y > this.y) {
      this.y = p2.y;
    }
  }

  public printDebug() {
    return `V2(${this.x}, ${this.y})`;
  }

  toJson() {
    return { x: this.x, y: this.y };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJson(json: any) {
    return new V2(json.x, json.y);
  }

}
