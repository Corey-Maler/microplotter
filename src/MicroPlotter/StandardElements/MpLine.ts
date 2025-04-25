import type { V2 } from '@/Math';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';
import { MPLenght } from './MpLength';
import { MPPoint } from './MpPoint';
import { V2$ } from '../cells/v2s';
import { type LineEnd, Shevron } from './LineEnds/Shevron';

export class MPLine extends MPElement {
  public _p1 = new V2$();
  public _p2 = new V2$();

  // public p1: V2 | V2$;
  // public p2: V2 | V2$;
  public get p1() {
    return this._p1.value;
  }

  public get p2() {
    return this._p2.value;
  }

  public set p1(v: V2) {
    this._p1.update(v);
  }

  public set p2(v: V2) {
    this._p2.update(v);
  }

  public color = '#000000';

  private lenghtElement?: MPLenght;

  public middle$ = this._p1.add$(this._p2).scale$(0.5);
  // public get middle(): V2 {
  //   return this.p1.add(this.p2).mul(0.5);
  // }

  public set showLenght(value: boolean) {
    if (value) {
      this.lenghtElement = new MPLenght(this._p1, this._p2);
      // const lt = this.lenghtElement;
      this.appendChild(this.lenghtElement);
      // lt.constrain('p1p2', () => [this.p1, this.p2]);
    } else {
      if (this.lenghtElement) {
        this.removeChild(this.lenghtElement);
      }
    }
  }

  public showLeftArrow(type: typeof LineEnd = Shevron) {
    const leftArrow = new type(this._p1, this._p2, { color: this.color });
    this.appendChild(leftArrow);
  }

  public showRightArrow(type: typeof LineEnd = Shevron) {
    const leftArrow = new type(this._p2, this._p1, { color: this.color });
    this.appendChild(leftArrow);
  }

  constructor(
    p1: V2 | V2$,
    p2: V2 | V2$,
    opts: { showMiddlePoint?: boolean } = {},
  ) {
    super();
    this._p1.adopt(p1);
    this._p2.adopt(p2);
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
    const point = new MPPoint(this.middle$);
    this.appendChild(point);

    // point.constrain('position', () => this.middle);
  }

  private setupAttractors() {
    this.engine?.addAttractorFor(this._p1);
    this.engine?.addAttractorFor(this._p2);
    this.engine?.addAttractorFor(this.middle$);
  }

  public tSelect() {
    //
    this.setupAttractors();
  }
}
