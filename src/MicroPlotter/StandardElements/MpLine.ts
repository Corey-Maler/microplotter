import type { V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';
import { MPLenght } from './MpLength';
import { MPPoint } from './MpPoint';

export class MPLine extends MPElement {
  public p1: V2;
  public p2: V2;

  public color = '#000000';

  private lenghtElement?: MPLenght;

  public get middle(): V2 {
    return this.p1.add(this.p2).mul(0.5);
  }

  public get length(): number {
    return this.p1.distanceTo(this.p2);
  }

  public set showLenght(value: boolean) {
    if (value) {
      this.lenghtElement = new MPLenght();
      const lt = this.lenghtElement;
      this.appendChild(lt);
      lt.constrain('p1p2', () => [this.p1, this.p2]);
    } else {
      if (this.lenghtElement) {
        this.removeChild(this.lenghtElement);
      }
    }
  }

  constructor(p1: V2, p2: V2, opts: { showMiddlePoint?: boolean } = {}) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    if (opts?.showMiddlePoint) {
      this.showMiddlePoint();
    }
  }

  render(renderer: CanvasRenderer): void {
    const { line, stroke } = renderer.batch(this.color);
    line(this.p1, this.p2);
    stroke();
  }

  private showMiddlePoint() {
    const point = new MPPoint(this.middle);
    this.appendChild(point);

    point.constrain('position', () => this.middle);
  }
}
