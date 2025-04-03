import { Rect2D, V2 } from "@/Math";
import { CanvasRenderer } from "@/MicroPlotter/render/CanvasRenderer";
import { MPElement } from "@/MicroPlotter/render/MPElement";

export class MyNode extends MPElement {
  public rect: Rect2D;
  public get position(): V2 {
    return this.rect.bottomLeft;
  }

  public set position(value: V2) {
    this.rect.v2 = this.rect.v2.add(value.sub(this.rect.v1));
    this.rect.v1 = value;
  }

  constructor(rect: Rect2D) {
    super();
    this.rect = rect;
  }

  render(renderer: CanvasRenderer) {
    const { rect, stroke } = renderer.batch('green');
    rect(this.rect);
    stroke();
  }
}
