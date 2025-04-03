import { V2 } from "@/Math";
import { CanvasRenderer } from "@/MicroPlotter/render/CanvasRenderer";
import { MPElement } from "@/MicroPlotter/render/MPElement";

export class MyText extends MPElement {
  public text = 'Hello!';
  public position: V2;
  constructor(pos: V2) {
    super()
    this.position = pos;
  }
  render(renderer: CanvasRenderer) {
    const { renderText } = renderer.batch('black');
    renderText(this.text, this.position);
    // stroke();
  }
}
