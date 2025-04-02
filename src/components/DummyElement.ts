import { V2 } from "@/Math";
import { CanvasRenderer } from "@/MicroPlotter/render/CanvasRenderer";
import { MPElement } from "@/MicroPlotter/render/MPElement";

export class DummyElement extends MPElement {
  render(renderer: CanvasRenderer) {

    const { path, stroke } = renderer.quickBatch('green');

    path([
      new V2(0.11, 0.11),
      new V2(0.11, 0.89),
      new V2(0.89, 0.89),
      new V2(0.89, 0.11),
      new V2(0.11, 0.11),
    ])
    stroke();


    renderer.webGL.p(
      [
        0.09, 0.09,
        0.09, 0.91,
        0.91, 0.91,
        0.91, 0.09,
        0.09, 0.09,
        0.91, 0.91,
        0.91, 0.09,
        0.09, 0.91
      ]
    );

    renderer.webGL.p([
      0.09, 0.09,
      0.09, 0.21,
      0.21, 0.21,
      0.21, 0.09,
      0.09, 0.09,
    ])
  }
}
