import type { V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';
import type { V2$ } from '../cells/v2s';
import { unwrap } from '../cells/cell';

export interface PointOptions {
  color?: string;
}

export class MPPoint extends MPElement {
  public position: V2 | V2$;

  constructor(p1: V2 | V2$, private options: PointOptions = {}) {
    super();
    this.position = p1;
  }

  render(renderer: CanvasRenderer): void {
    const { point, fill } = renderer.batch(this.options.color ?? 'orange');
    point(unwrap(this.position));
    fill();
  }
}
