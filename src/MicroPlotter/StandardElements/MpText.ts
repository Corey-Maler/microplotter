import { Rect2D, V2 } from "@/Math";
import { MPElement } from "../render/MPElement";
import { CanvasRenderer } from "../render/CanvasRenderer";
import { MPRect } from "./MpRect";

export class MPText extends MPElement {
  public position: V2;
  public text: string;
  public boundary: MPRect;

  public get size(): V2 {
    const textSize = this.engine?.renderer.measureText(this.text);
    return textSize ? textSize : new V2(0, 0);
  }

  public set center(value: V2) {
    const textSize = this.engine?.renderer.measureText(this.text);

    if (textSize) {
      this.position = value.sub(textSize.half);
      this.boundary.rect = new Rect2D(this.position, this.position.add(textSize));
    } else {
      this.position = value;
    }
  }

  constructor(text: string, p: V2) {
    super();
    this.position = p;
    this.text = text;

    this.boundary = new MPRect(this.position, this.position.add(new V2(0.1, 0.1)));
    this.appendChild(this.boundary)
  }

  render(renderer: CanvasRenderer): void {
    const { renderText } = renderer.batch("red");
    renderText(this.text, this.position);
    // stroke();
  }
}
