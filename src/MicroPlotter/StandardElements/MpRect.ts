import { Rect2D, V2 } from "@/Math";
import { MPElement } from "../render/MPElement";
import { CanvasRenderer } from "../render/CanvasRenderer";

export class MPRect extends MPElement {
  public rect: Rect2D;

  constructor(p1: V2, p2: V2) {
    super();
    const rect = new Rect2D(p1, p2);
    this.rect = rect;
  }

  render(renderer: CanvasRenderer): void {
    const { rect, stroke } = renderer.batch("orange");
    rect(this.rect);
    stroke();
  }
}
