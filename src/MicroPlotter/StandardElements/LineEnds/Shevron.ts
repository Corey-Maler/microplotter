import { V2 } from "@/Math";
import { Angles } from "@/Math/Angles";
import { V2$ } from "@/MicroPlotter/cells/v2s";
import { CanvasRenderer } from "@/MicroPlotter/render/CanvasRenderer";
import { MPElement } from "@/MicroPlotter/render/MPElement";

export interface LineEndProps {
  size: number;
  color: string;
  sizing?: "px" | "world";
}

const DEFAULT_LINE_END_PROPS: LineEndProps = {
  size: 0.007,
  color: "red",
  sizing: 'world'
};

export class LineEnd extends MPElement {
  pointsTo = new V2$();
  pointsFrom = new V2$();
  options: LineEndProps;
  constructor(
    pointTo: V2 | V2$,
    pointFrom: V2 | V2$,
    props: Partial<LineEndProps> = {},
  ) {
    super();

    this.pointsTo.adopt(pointTo);
    this.pointsFrom.adopt(pointFrom);
    this.options = {
      ...DEFAULT_LINE_END_PROPS,
      ...props,
    };
  }
}

export class Shevron extends LineEnd {
  public render(renderer: CanvasRenderer): void {
    const { line, stroke } = renderer.batch(this.options.color);

    const p1 = this.pointsTo.value;
    const p2 = this.pointsFrom.value;

    const angle = p1.angleTo(p2);

    const size = this.options.sizing === 'world' ? this.options.size : renderer.measureScreenInWorld(this.options.size);

    const l1 = new V2(size, 0).setAngle(angle + Angles.d30);
    const l2 = new V2(size, 0).setAngle(angle - Angles.d30);

    line(p1, p1.sub(l1));
    line(p1, p1.sub(l2));

    stroke();
  }
}
