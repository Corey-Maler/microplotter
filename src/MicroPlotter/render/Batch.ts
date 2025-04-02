import { M3, Rect2D, V2 } from "@/Math";
import { incrPerfCounter } from "../../components/Perf/model";

// NOTE, this is not "native" batch, but abstract

export interface LL {
  moveTo(v: V2): void;

  lineTo(v: V2): void;
  arc(v: V2, radius: number, startAngle?: number, endAngle?: number): void;

  updateViewMatrix(vm: M3): void;

  beginPath(): void;
  stroke(): void;

  fill(): void;
  fillText(text: string, p: V2, color?: string, fontSize?: number): void;

  set fillStyle(color: string);

  set strokeStyle(color: string);

  p(points: number[]): void;
}

export class LLSoftware implements LL {
  private viewMatrix: M3;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(viewMatrix: M3, ctx: CanvasRenderingContext2D) {
    this.viewMatrix = viewMatrix;
    this.ctx = ctx;
  }

  public p() {
    throw new Error('not implemented');
  }

  updateViewMatrix(vm: M3) {
    this.viewMatrix = vm;
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

  public fillText(text: string, p: V2, color = 'black', fontSize = 14) {
    const pp = this.viewMatrix.multiplyV2(p);

    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial`;

    this.ctx.fillText(text, pp.x, pp.y);
  }

  public arc(v: V2, radius: number, startAngle = 0, endAngle = Math.PI * 2) {
    const p = this.viewMatrix.multiplyV2(v);
    this.ctx.arc(p.x, p.y, radius, startAngle, endAngle);
  }

}

export class Batch {
  private color: string;
  constructor(private readonly ll: LL, color: string, private lineWidth = 1) {
    this.color = color;

    this.renew();
  }

  renew = (newColor?: string) => {
    if (newColor) {
      this.color = newColor;
    }
    //this.ctx.beginPath();
    this.ll.beginPath();
  }


  line = (start: V2, end: V2) => {
    this.ll.moveTo(start);
    this.ll.lineTo(end);
  }

  p = (points: number[]) => {
    this.ll.p(points);
  }

  path = (points: V2[]) => {
    if (points.length < 2) {
      return;
    }

    incrPerfCounter('path points', points.length);
    const p0 = points[0];
    this.ll.moveTo(p0);

    for (let i = 1; i < points.length; i++) {
      this.ll.lineTo(points[i]);
    }
  }

  rect = (p1: V2 | Rect2D, p2?: V2) => {
    if (p1 instanceof Rect2D) {
      this.rect(p1.v1, p1.v2);
      return;
    }

    if (!p2) {
      throw new Error('rect overload not implemented');
    }

    this.ll.moveTo(p1);
    this.ll.lineTo(new V2(p1.x, p2.y));
    this.ll.lineTo(p2);
    this.ll.lineTo(new V2(p2.x, p1.y));
    this.ll.lineTo(p1);
  }

  stroke = () => {
    this.ll.strokeStyle = this.color;
    this.ll.stroke();
  }

  fill = () => {
    this.ll.fillStyle = this.color;
    this.ll.fill();
  }

  renderText = (text: string, p: V2, size?: number) => {
    this.ll.fillText(text, p, this.color, size);
  }

  point(p: V2) {
    this.ll.arc(p, 5);
    return this;
  }
}
