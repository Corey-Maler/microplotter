import { MicroPlotterEngine } from "../engine/engine";
import { CanvasRenderer } from "./CanvasRenderer";

export class MPElement {
  protected engine?: MicroPlotterEngine;

  setup(engine: MicroPlotterEngine) {
    this.engine = engine;
  }


  render(renderer: CanvasRenderer) {
    throw new Error('Method not implemented.');
  }
}
