import { V2 } from "@/Math";
import type { CanvasRenderer } from "../render/CanvasRenderer";
import { MPElement } from "../render/MPElement";
import { MPLine } from "./MpLine";
import { MPPoint } from "./MpPoint";
import { MPText } from "./MpText";
import { V2$ } from "../cells/v2s";
import { batch } from "../cells/cell";

const MAGIC_PADDING = 0.01;

const LENGHT_COLOR = "#666666";

export class MPLenght extends MPElement {
  private _p1 = new V2$();
  private _p2 = new V2$();

  private offsetVector: V2 = new V2(0, MAGIC_PADDING);

  private offset$ = V2$.fromCell(V2$.combine(this._p1, this._p2).derive(([p1, p2]) => {
    let angle = p1.angleTo(p2) - Math.PI / 2;
    if (angle > -Math.PI && angle < 0) {
      angle += Math.PI;
    }
    return this.offsetVector.setAngle(angle)
  })) //this.offsetVector.setAngle(this._p2.angleTo$(this._p1) + Math.PI / 2);

  private s1$ = this._p1.add$(this.offset$);
  private s2$ = this._p2.add$(this.offset$);

  // private get angle() {
  //   return this._p2.sub$(this._p1).angle;
  // }

  public readonly angle$ = this._p2.angleTo$(this._p1);

  public set p1(value: V2) {
    this._p1.value = value;
  }

  public set p2(value: V2) {
    // this._p2 = value.add(new V2(0, MAGIC_PADDING));
    this._p2.value = value;
  }

  public get p1(): V2 {
    return this._p1.value;
  }

  public get p2(): V2 {
    return this._p2.value;
  }

  private lenghtText?: MPText;
  private leftLine?: MPLine;
  private rightLine?: MPLine;

  public readonly middle$ = this._p1.add$(this._p2).scale$(0.5);

  /*
  public get middle(): V2 {
    return this.p1.add(this.p2).mul(0.5);
  }
  */

  // public readonly length$ = derive(() => this._p1.distanceTo(this._p2));
  public readonly length$ = V2$.combine(this._p1, this._p2).derive(([p1, p2]) =>
    p1.distanceTo(p2),
  );
  /*
  public get length(): number {
    return this.p1.distanceTo(this.p2);
  }
  */

  public showLenght() {
    // const dist = this.p1.distanceTo(this.p2);
    // const center = this.p1.add(this.p2).mul(0.5);

    const t = new MPText(
      this.length$.derive((value) => value.toFixed(2)),
      this.middle$.add$(this.offset$),
    );

    this.lenghtText = t; //new MPText(dist.toFixed(2), center);
    this.appendChild(this.lenghtText);

    const lt = this.lenghtText;
    lt.color = LENGHT_COLOR;

    // lt.constrain("text", () => this.length.toFixed(2));
    // lt.constrain("center", () => this.middle);

    lt.rotation = this.angle$.derive((angle) => {
      const PI = Math.PI;
      if (angle > PI / 2) {
        return angle - PI;
      }
      if (angle < -PI / 2) {
        return angle + PI;
      }
      return angle;
    });

    /*
    lt.constrain("rotation", () => {
      const PI = Math.PI;
      const angle = this.angle;
      if (angle > PI / 2) {
        return angle - PI;
      }
      if (angle < -PI / 2) {
        return angle + PI;
      }
      return angle;
    });
    */
  }

  private setupLeftAndRight() {
    const textOffset$ = V2$.fromCell(this.angle$.derive(angle => {
      const ts = this.lenghtText?.size!;
      const v = ts.x / 2 + MAGIC_PADDING / 2;
      const f = new V2(v, 0);
      return f.setAngle(angle);
    }));
    const leftLine = new MPLine(this.s1$, this.middle$.add$(this.offset$).add$(textOffset$.scale$(-1)));
    const rightLine = new MPLine(this.middle$.add$(this.offset$).add$(textOffset$), this.s2$);

    leftLine.color = LENGHT_COLOR;
    rightLine.color = LENGHT_COLOR;

    leftLine.showLeftArrow();
    rightLine.showRightArrow();

    this.leftLine = leftLine;
    this.rightLine = rightLine;

    this.appendChild(leftLine);
    this.appendChild(rightLine);

    // leftLine.constrain("p1", () => this.p1);
    // leftLine.constrain("p2", () => {
    //   const ts = this.lenghtText?.size;
    //   if (ts) {
    //     const diff = this.middle.sub(this.p1);
    //     const shortenVector = diff.shortenBy(ts.x / 2 + MAGIC_PADDING / 2);
    //     return this._p1.add(shortenVector);
    //   } else {
    //     return this.middle;
    //   }
    // });

    // rightLine.constrain("p1", () => {
    //   const ts = this.lenghtText?.size;
    //   if (ts) {
    //     const diff = this.p2.sub(this.middle);
    //     const shortenVector = diff.shortenBy(ts.x / 2 + MAGIC_PADDING / 2);
    //     return this._p2.sub(shortenVector);
    //   } else {
    //     return this.middle;
    //   }
    // });
    // rightLine.constrain("p2", () => this.p2);
  }

  constructor(p1: V2$, p2: V2$) {
    super();
    this._p1.adopt(p1);
    this._p2.adopt(p2);
    // this._p1 = new V2(0, 0);
    // this._p2 = new V2(0, 0);

    this.showLenght();
    this.setupLeftAndRight();

    const m = new MPPoint(this.middle$, { color: 'red'})
    this.appendChild(m)

    const l = new MPPoint(this._p1, { color: 'green'})
    this.appendChild(l)
    const r = new MPPoint(this._p2, { color: 'green'})
    this.appendChild(r)

    const dl = new MPPoint(this.s1$, { color: 'blue'})
    this.appendChild(dl)

    const dr = new MPPoint(this.s2$, { color: 'blue'})
    this.appendChild(dr)
  }

  render(renderer: CanvasRenderer): void {}
}
