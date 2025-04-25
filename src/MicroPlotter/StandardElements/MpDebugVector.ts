import { V2 } from "@/Math";
import { V2$ } from "../cells/v2s";
import { MPElement } from "../render/MPElement";
import { Shevron } from "./LineEnds/Shevron";
import { MPLine } from "./MpLine";
import { CanvasRenderer } from "../render/CanvasRenderer";

export class MPDebugVector extends MPElement {
  public start: V2$;
  public end: V2$;
  public color = '#000000';
  public width = 1;

  constructor(start: V2$, end: V2$) {
    super();
    this.start = start;
    this.end = end;
  }

//   compose() {
//     return [
//         new MPLine(this.start, this.end),
//         new Shevron(this.end, this.start),
//     ]
//   }

  public render(renderer: CanvasRenderer): void {
    const { line, stroke } = renderer.batch(this.color);

    const start = this.start.value;
    const end = this.end.value;

    line(start, end);

    const arrowSize = renderer.measureScreenInWorld(10); // Adjust arrow size as needed

    // Calculate direction vector for the arrow
    const direction = end.sub(start).normalize();

    // Calculate perpendicular vector for the arrow wings
    const perpendicular = new V2(-direction.y, direction.x).scale(arrowSize / 2);

    // Calculate arrow wing points
    const arrowLeft = end.sub(direction.scale(arrowSize)).add(perpendicular);
    const arrowRight = end.sub(direction.scale(arrowSize)).sub(perpendicular);

    // Draw arrow wings
    line(end, arrowLeft);
    line(end, arrowRight);

    stroke();
    
  }
}