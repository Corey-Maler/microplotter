import { Rect2D, type V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';

export class MPPoint extends MPElement {
  public position: V2;

  constructor(p1: V2) {
    super();
    this.position = p1;
  }

  render(renderer: CanvasRenderer): void {
    const { rect, point, fill } = renderer.batch('orange');
    point(this.position);
    // stroke();
    fill();
  }
}
