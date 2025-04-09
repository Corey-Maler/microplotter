import { Rect2D, type V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';

export class MPRect extends MPElement {
  public rect: Rect2D;

  constructor(p1: V2, p2: V2) {
    super();
    const rect = new Rect2D(p1, p2);
    this.rect = rect;
  }

  render(renderer: CanvasRenderer): void {
    const { rect, stroke } = renderer.batch('orange');
    rect(this.rect);
    stroke();
  }
}
