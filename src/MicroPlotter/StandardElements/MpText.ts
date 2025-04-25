import { V2 } from "@/Math";
import type { CanvasRenderer } from "../render/CanvasRenderer";
import { MPElement } from "../render/MPElement";
import { V2$ } from "../cells/v2s";
import { Cell, unwrap } from "../cells/cell";

export type TextAlign = "left" | "center" | "right";

export interface MPTextOptions {
  align?: TextAlign;
}

export class MPText extends MPElement {
  public position: V2 | V2$;
  public text: string | Cell<string>;
  // public boundary: MPRect;
  public color = "#000000";

  public align: TextAlign = "center";

  private getText() {
    return this.text instanceof Cell ? this.text.value : this.text;
  }

  public get size(): V2 {
    const textSize = this.engine?.renderer.measureText(this.getText());
    return textSize ? textSize : new V2(0, 0);
  }

  public get origin(): V2 {
    // in a future we want to have ability to specify rotation origin explicitly
    // at the moment it is always at position at which it rendered
    return unwrap(this.position);
  }

  constructor(text: string | Cell<string>, p: V2 | V2$, options?: MPTextOptions) {
    super();
    this.position = p;
    this.text = text;

    if (options) {
      this.align = options.align ?? this.align;
    }
  }

  render(renderer: CanvasRenderer): void {
    const { renderText, rect, stroke } = renderer.batch(this.color);
    const text = this.getText();
    let pos =
      this.position instanceof V2$ ? this.position.value : this.position;

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const box = renderer.measureText(text);

    switch (this.align) {
      case "left":
        break;
      case "center":
        pos = pos.sub(box.half);
        break;
      case "right":
        pos = pos.sub(box);
        break;
    }

    renderText(text, pos, 18);
    stroke();
  }
}
