import { M3, V2, Rect2D } from "@/Math";
import { Colors } from "./colors";
import { printDebugValue } from "../../components/Perf/model";
import { Batch, LL, LLSoftware } from "./Batch";
import { WebGLBatchLL } from "./WebGLBatch";
import { MouseEventHandlers } from "./MouseEventHandlers";
import { PanningTracker } from "./PanningTracker";
import { ViewPort } from "./ViewPort";
import { MPElement } from "./MPElement";

export class CanvasRenderer {
  protected rootDiv = document.createElement("div");
  public readonly ll: LL;
  // without transform, so 10 - is 10 pixels
  public readonly llScreenSpace: LL;

  public canvas: HTMLCanvasElement;
  private webGlCanvas: HTMLCanvasElement;
  public getHTML() {
    return this.rootDiv;
  }

  public get webGL(): WebGLBatchLL {
    if (!this._webGlLL) {
      throw new Error("WebGL LL is not yet setup");
    }
    return this._webGlLL;
  }

  public ctx: CanvasRenderingContext2D;
  public get $mousePositionScreen() {
    return this.mouseHandlers.$mousePositionScreen;
  }

  public get $mousePosition() {
    return this.mouseHandlers.$mousePositionWorld;
  }

  private updated = true;

  private _webGlLL?: WebGLBatchLL;

  public get viewMatrix() {
    return this.panningTracker.viewMatrix;
  }

  public get width() {
    return this.canvas.width;
  }

  public get height() {
    return this.canvas.height;
  }

  public get viewPortRatio() {
    return this.viewPortTracker.viewPortRatio;
  }

  public get viewPort() {
    return new V2(this.width, this.height);
  }

  private panningTracker: PanningTracker;
  private viewPortTracker: ViewPort;
  public mouseHandlers: MouseEventHandlers;

  public worldToScreen(p: V2) {
    return this.viewMatrix.multiplyV2(p);
  }

  public screenToWorld(p: V2) {
    return this.panningTracker.screenToWorld(p);
  }

  public get mousePosition() {
    return this.mouseHandlers.mousePosition;
  }

  public rectToScreen(r: Rect2D) {
    return new Rect2D(
      this.worldToScreen(r.bottomLeft),
      this.worldToScreen(r.topRight),
    );
  }

  public get visibleArea() {
    const m = this.viewMatrix.inverse();
    const p1 = m.multiplyV2(new V2(0, 0));
    const p3 = m.multiplyV2(new V2(this.width, this.height));
    return new Rect2D(p1, p3);
  }

  private setupStyles() {
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.zIndex = "1";

    this.webGlCanvas.style.position = "absolute";
    this.webGlCanvas.style.top = "0px";
    this.webGlCanvas.style.left = "0px";
    this.webGlCanvas.style.pointerEvents = "none";
    this.webGlCanvas.style.zIndex = "3";

    this.rootDiv.style.position = "relative";
    this.rootDiv.style.flex = "1";
  }

  private setupObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.onCanvasResize(width, height);
        // this.updateShiftMatrix();
      }
    });

    resizeObserver.observe(this.rootDiv);
  }

  constructor(private readonly simpleEngine: { requestUpdate: () => void }) {
    const canvas = document.createElement("canvas");
    const webGlCanvas = document.createElement("canvas");
    
    // Set the WebGL canvas to have proper transparency
    webGlCanvas.style.backgroundColor = "transparent";

    this.canvas = canvas;
    this.webGlCanvas = webGlCanvas;
    this.rootDiv.appendChild(canvas);
    this.rootDiv.appendChild(webGlCanvas);

    this.setupStyles();
    const requestUpdate = () => this.simpleEngine.requestUpdate();
    this.viewPortTracker = new ViewPort(this.canvas.width, this.canvas.height);
    this.panningTracker = new PanningTracker(
      this.viewPortTracker,
      requestUpdate,
    );
    this.mouseHandlers = new MouseEventHandlers(
      this.canvas,
      this.panningTracker,
      this.viewPortTracker,
      requestUpdate,
    );

    const ctx = canvas.getContext("2d")!;
    this.ctx = ctx;

    this.ll = new LLSoftware(this.viewMatrix, ctx);
    this.llScreenSpace = new LLSoftware(M3.identity(), ctx);

    this._webGlLL = new WebGLBatchLL(webGlCanvas);

    // this.updateShiftMatrix();
    this.setupObserver();
  }

  public onCanvasResize = (x: number, y: number) => {
    this.viewPortTracker.update(x, y);
    const ratio = this.viewPortTracker.HDPI;
    this.canvas.width = x * ratio;
    this.canvas.height = y * ratio;

    this.canvas.style.width = x + "px";
    this.canvas.style.height = y + "px";

    this.webGlCanvas.width = x * ratio;
    this.webGlCanvas.height = y * ratio;

    this._webGlLL?.resize(x * ratio, y * ratio);

    this.webGlCanvas.style.width = x + "px";
    this.webGlCanvas.style.height = y + "px";

    this.panningTracker.updateWorldSpaceMatrix();
    this.panningTracker.recalculate();
  };

  protected clearBackground() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = Colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public prepare() {
    // skip rendering if nothing changed
    if (!this.updated) {
      // return;
    }

    printDebugValue("zoom", this.panningTracker.zoom);

    this.updated = false;

    this.clearBackground();

    this.ll.updateViewMatrix(this.panningTracker.viewMatrix);
    this._webGlLL?.updateViewMatrix(this.panningTracker.webGLMatrix);
    this._webGlLL?.prepareRender();
  }

  public postRender(dt: number) {
    this.renderFPS(dt);
    this._webGlLL?.finishRender();
  }

  private renderFPS(dt: number) {
    const { renderText } = this.batchScreenSpace("#333333");
    renderText("FPS: " + Math.round(1 / (dt / 1000)), new V2(10, 20));
  }

  public measureText(text: string) {
    const measurements = this.ctx.measureText(text);

    const height =
      measurements.actualBoundingBoxAscent +
      measurements.actualBoundingBoxDescent;
    return new V2(
      measurements.width / this.viewPortTracker.width,
      height / this.viewPortTracker.height,
    );
    // return this.panningTracker.screenToWorld(
    //   new V2(
    //     measurements.width,
    //     height
    //   )
    // )
  }

  public prepareScreen(el: MPElement) {
    if (el.rotation !== 0) {
      // move to LLSoftware
      const shift = this.viewMatrix.multiplyV2(el.origin);
      this.ctx.save();
      this.ctx.translate(shift.x, shift.y);
      // note that we display in such way that y0 is at the bottom left
      // that makes everything flipped, which requires us to flip rotation
      this.ctx.rotate(-el.rotation);
      this.ctx.translate(-shift.x, -shift.y);
    }
  }

  public resetScreen(el: MPElement) {
    if (el.rotation !== 0) {
      this.ctx.restore();
    }
  }

  public batch(initialColor: string, lineWidth = 1) {
    return new Batch(this.ll, initialColor, lineWidth);
  }

  public batchScreenSpace(initialColor: string, lineWidth = 1) {
    return new Batch(this.llScreenSpace, initialColor, lineWidth);
  }

  public webGlBatch(color?: string) {
    if (!this._webGlLL) {
      throw new Error("Webgl LL is not yet setup");
    }
    return new Batch(this._webGlLL, color || "black", 1);
  }
}
