import { Rect2D, V2 } from "@/Math";
import { MPElement } from "../render/MPElement";
import { CanvasRenderer } from "../render/CanvasRenderer";

export class MPPoint extends MPElement {
  public position: V2;

  constructor(p1: V2) {
    super();
    this.position = p1;
  }

  render(renderer: CanvasRenderer): void {
    const { rect, point, fill } = renderer.batch("orange");
    point(this.position);
    // stroke();
    fill()
  }
}
