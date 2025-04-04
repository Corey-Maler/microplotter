import { V2 } from "@/Math";
import { MPElement } from "../render/MPElement";
import { CanvasRenderer } from "../render/CanvasRenderer";
import { MPText } from "./MpText";
import { MPPoint } from "./MpPoint";
import { MPLine } from "./MpLine";

const MAGIC_PADDING = 0.01;

export class MPLenght extends MPElement {
  private _p1: V2;
  private _p2: V2;

  public set p1p2(value: [V2, V2]) {
    const p1 = value[0]
    const p2 = value[1]
    const diff = p2.sub(p1);
    const pad = new V2(0, MAGIC_PADDING).setAngle(diff.angle + Math.PI / 2)

    this._p1 = p1.add(pad);
    this._p2 = p2.add(pad);
  }

  public set p1(value: V2) {
    this._p1 = value.add(new V2(0, MAGIC_PADDING));
  }

  public set p2(value: V2) {
    this._p2 = value.add(new V2(0, MAGIC_PADDING));
  }

  public get p1(): V2 {
    return this._p1;
  }

  public get p2(): V2 {
    return this._p2;
  }

  private lenghtText?: MPText;
  private leftLine?: MPLine;
  private rightLine?: MPLine;

  public get middle(): V2 {
    return this.p1.add(this.p2).mul(0.5);
  }

  public get length(): number {
    return this.p1.distanceTo(this.p2);
  }

  public showLenght() {
      const dist = this.p1.distanceTo(this.p2);
      const center = this.p1.add(this.p2).mul(0.5);

      this.lenghtText = new MPText(dist.toFixed(2), center);
      this.appendChild(this.lenghtText);

      const lt = this.lenghtText;

      lt.constrain(
        'text',
        () => this.length.toFixed(2)
      )

      lt.constrain('center', () => this.middle);
  }

  private setupLeftAndRight() {
    const leftLine = new MPLine(this._p1, this.middle);
    const rightLine = new MPLine(this.middle, this._p2);

    this.leftLine = leftLine;
    this.rightLine = rightLine;

    this.appendChild(leftLine)
    this.appendChild(rightLine)

    leftLine.constrain('p1', () => this.p1);
    leftLine.constrain('p2', () => {
      const ts = this.lenghtText?.size;
      if (ts) {
        const diff = this.middle.sub(this.p1);
        const shortenVector = diff.shortenBy(ts.x / 2 + MAGIC_PADDING / 2);
        return this._p1.add(shortenVector);
      } else {
        return this.middle;
      }
    });

    rightLine.constrain('p1', () => {
      const ts = this.lenghtText?.size;
      if (ts) {
        const diff = this.p2.sub(this.middle);
        const shortenVector = diff.shortenBy(ts.x / 2 + MAGIC_PADDING / 2);
        return this._p2.sub(shortenVector);
      } else {
        return this.middle;
      }
    });
    rightLine.constrain('p2', () => this.p2);
  }

  constructor() {
    super();
    this._p1 = new V2(0, 0);
    this._p2 = new V2(0, 0);

    this.showLenght();
    this.setupLeftAndRight()
  }

  render(renderer: CanvasRenderer): void {

  }

}
