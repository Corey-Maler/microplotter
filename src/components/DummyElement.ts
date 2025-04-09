import { V2 } from '@/Math';
import type { CanvasRenderer } from '@/MicroPlotter/render/CanvasRenderer';
import { MPElement } from '@/MicroPlotter/render/MPElement';

export class DummyElement extends MPElement {
  render(renderer: CanvasRenderer) {
    const { path, stroke } = renderer.batch('green');

    path([
      new V2(0.11, 0.11),
      new V2(0.11, 0.89),
      new V2(0.89, 0.89),
      new V2(0.89, 0.11),
      new V2(0.11, 0.11),
    ]);
    stroke();

    renderer.webGL.p3(
      new Float32Array([
        0.09, 0.09, 0.09, 0.91, 0.91, 0.91, 0.91, 0.09, 0.09, 0.09, 0.91, 0.91,
        0.91, 0.09, 0.09, 0.91,
      ]),
      [0],
      [8],
      ['#666600'],
    );

    renderer.webGL.p3(
      new Float32Array([
        0.09, 0.09, 0.09, 0.21, 0.21, 0.21, 0.21, 0.09, 0.09, 0.09,
      ]),
      [0],
      [5],
      ['#ff0000'],
    );
  }
}
