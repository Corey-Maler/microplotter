import type { V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';
import type { V2$ } from '../cells/v2s';
import { unwrap } from '../cells/cell';
import { Colors } from '../Color/Colors';

export interface AttractorOptions {
  color?: string;
}

export class MPAttractor extends MPElement {
  public position: V2$;

  constructor(p1: V2$, private options: AttractorOptions = {}) {
    super();
    this.position = p1;
  }

  testHover = (p: V2, within: number) => {
    const v = unwrap(this.position);
    const hovered =  v.distanceTo(p) < within;
    // console.log('hovered', hovered);
    return hovered;
  }

  // onHover = () => {
  //   this.hovered = true;
  // }

  // onLeave = () => {
  //   this.hovered = false;
  // }

  render(renderer: CanvasRenderer): void {
    const color = Colors.orange; //this.hovered ? Colors.red : Colors.orange;
    const { point, fill } = renderer.batch(color);
    point(unwrap(this.position), this.hovered);
    fill();
  }
}
