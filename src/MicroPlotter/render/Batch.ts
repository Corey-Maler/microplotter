import { type M3, Rect2D, V2 } from "@/Math";
import { incrPerfCounter } from "../../components/Perf/model";
import { V2$ } from "../cells/v2s";
import { Color } from "../Color/Colors";

// NOTE, this is not "native" batch, but abstract

// export interface LL {
//   moveTo(v: V2): void;

//   lineTo(v: V2): void;
//   arc(v: V2, radius: number, startAngle?: number, endAngle?: number, clk?: boolean): void;

//   updateViewMatrix(vm: M3): void;

//   beginPath(): void;
//   stroke(): void;

//   fill(): void;
//   fillText(text: string, p: V2, color?: string, fontSize?: number): void;

//   set fillStyle(color: string);

//   set strokeStyle(color: string);

//   p(points: number[]): void;
// }

export class LLSoftware {
  private viewMatrix: M3;
  protected readonly ctx: CanvasRenderingContext2D;

  constructor(viewMatrix: M3, ctx: CanvasRenderingContext2D) {
    this.viewMatrix = viewMatrix;
    this.ctx = ctx;
  }

  public p() {
    throw new Error("not implemented");
  }

  updateViewMatrix(vm: M3) {
    this.viewMatrix = vm;
  }

  protected toPixels(p: V2) {
    const pp = this.viewMatrix.multiplyV2(p);
    return pp;
  }

  public moveTo(v: V2) {
    const p = this.viewMatrix.multiplyV2(v);
    this.ctx.moveTo(p.x, p.y);
  }

  public lineTo(v: V2) {
    const p = this.viewMatrix.multiplyV2(v);
    this.ctx.lineTo(p.x, p.y);
  }

  public beginPath() {
    this.ctx.beginPath();
  }

  public stroke() {
    this.ctx.stroke();
  }

  public fill() {
    this.ctx.fill();
  }

  public set fillStyle(color: string) {
    this.ctx.fillStyle = color;
  }

  public set strokeStyle(color: string) {
    this.ctx.strokeStyle = color;
  }

  public fillText(text: string, p: V2, color = "black", fontSize = 14) {
    const pp = this.viewMatrix.multiplyV2(p);

    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;

    this.ctx.fillText(text, pp.x, pp.y);
  }

  public arc = (v: V2, radius: number, startAngle = 0, endAngle = Math.PI * 2, clk = false) => {
    const p = this.viewMatrix.multiplyV2(v);
    const v1 = this.viewMatrix.multiplyV2(new V2(0, 0));
    const v2 = this.viewMatrix.multiplyV2(new V2(radius, 0));
    this.ctx.arc(p.x, p.y, Math.abs(v2.x - v1.x), startAngle, endAngle, clk);
  }
// }

/* for native if needed
protected transformToViewSpace() {
  if (NATIVE_TRANSFORM) {
    const transform = true;

    if (transform) {
      this.ctx.setTransform(
        this.zoom,
        0,
        0,
        this.zoom,
        this.center.x,
        this.center.y
      );
    }

    this.ctx.transform(
      this.worldSpaceMatrix.matrix[0],
      this.worldSpaceMatrix.matrix[1],
      this.worldSpaceMatrix.matrix[3],
      this.worldSpaceMatrix.matrix[4],
      this.worldSpaceMatrix.matrix[6],
      this.worldSpaceMatrix.matrix[7]
    );
  }
}
*/
}

export class Batch  extends LLSoftware {
  private color: string | Color = "#000000";
  // constructor(
  //   private readonly ll: LL,
  //   color: string | Color,
  //   private lineWidth = 1,
  // ) {
  //   this.color = color;

  //   this.renew();
  // }

  renew = (newColor?: string, width?: number) => {
    if (newColor) {
      this.color = newColor;
    }
    //this.ctx.beginPath();
    this.beginPath();
  };

  line = (start: V2, end: V2) => {
    this.moveTo(start);
    this.lineTo(end);
  };

  // p = (points: number[]) => {
  //   this.p(points);
  // };

  path = (points: V2[]) => {
    if (points.length < 2) {
      return;
    }

    incrPerfCounter("path points", points.length);
    const p0 = points[0];
    this.moveTo(p0);

    for (let i = 1; i < points.length; i++) {
      this.lineTo(points[i]);
    }
  };

  rect = (p1: V2 | Rect2D, p2?: V2) => {
    if (p1 instanceof Rect2D) {
      this.rect(p1.v1, p1.v2);
      return;
    }

    if (!p2) {
      throw new Error("rect overload not implemented");
    }

    this.moveTo(p1);
    this.lineTo(new V2(p1.x, p2.y));
    this.lineTo(p2);
    this.lineTo(new V2(p2.x, p1.y));
    this.lineTo(p1);
  };

  stroke = () => {
    this.strokeStyle = this.color.toString();
    super.stroke();
  };

  fill = () => {
    this.fillStyle = this.color.toString();
    super.fill();
  };

  renderText = (text: string, p: V2 | V2$, size?: number) => {
    if (p instanceof V2$) {
      this.fillText(text, p.value, this.color.toString(), size);
    } else {
      this.fillText(text, p, this.color.toString(), size);
    }
  };

  point = (p: V2, halo?: boolean) => {
    const r = 5;
    if (halo && this.color instanceof Color) {
      this.fillStyle = this.color.opaque(0.5).toString();
      // console.log('fill fillStyle', this.color.opaque(0.5).toString());
      this.arcInPx(p, r * 2);
      this.fill();
      this.beginPath();
      this.fillStyle = this.color.toString();
    }
    this.arcInPx(p, r);

    // this.ll.rect()
    return this;
  };

  private arcInPx = (p: V2, radius: number) => {
    const pp = this.toPixels(p);
    this.ctx.arc(pp.x, pp.y, radius, 0, Math.PI * 2);
  }
}

//   arc = (center: V2, radius: number, start: number, end: number, clk?: boolean) => {
//     // this.ll.moveTo(center);
//     this.ll.arc(center, radius, start, end, clk);
//   };
// }
