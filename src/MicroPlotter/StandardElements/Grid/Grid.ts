import { V2 } from "@/Math";
import { MPElement } from "../../render/MPElement";
import { CanvasRenderer } from "../../render/CanvasRenderer";
import { Colors } from "../../render/colors";
import { getAdaptiveGrid } from "./getAdaptiveGrid";

export class Grid extends MPElement {
  /*
  constructor(private renderer: CanvasRenderer) {

  }
  */

  public render(renderer: CanvasRenderer) {

    const v = renderer.visibleArea;

    const gridX = getAdaptiveGrid(v.bottomLeft.x, v.topRight.x)
    console.log({
      from: v.bottomLeft.x,
      to: v.topRight.x,
    ...gridX
    })
    // const gridX = getMeterGrid(v.bottomLeft.x, v.topRight.x, 6)
    const gridY = getAdaptiveGrid(v.bottomLeft.y, v.topRight.y)
    // const gridY = getMeterGrid(v.bottomLeft.y, v.topRight.y, 6)

    const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(gridX.subgridOpacity));
    // console.log('zoom factor', gridX.minorOpacity, gridX.subMinorOpacity)
    // const { line, stroke, renew } = renderer.batch(Colors.grid.secondary(1));

    const x0 = v.bottomLeft.x;
    const y0 = v.bottomLeft.y;
    const x1 = v.topRight.x;
    const y1 = v.topRight.y;

    for (const x of gridX.subgrid) {
      line(new V2(x, y0), new V2(x, y1))
    }

    for (const y of gridY.subgrid) {
      line(new V2(x0, y), new V2(x1, y));
    }

    stroke();

    renew(Colors.grid.primary);


    for (const x of gridX.grid) {
      line(new V2(x, y0), new V2(x, y1))
    }

    for (const y of gridY.grid) {
      line(new V2(x0, y), new V2(x1, y))
    }

    stroke();
  }
}
