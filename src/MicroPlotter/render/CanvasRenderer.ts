import { M3, V2, Rect2D } from '@/Math';
import { Colors } from './colors';
import { printDebugValue } from '../../components/Perf/model';
import { Observable } from '../../utils/observable';
import { Batch, LL, LLSoftware } from './Batch';
import { WebGLBatchLL } from './WebGLBatch';

// while native transform is faster,
// in "software" transform easier to show correct scales, font sizes and line width
const NATIVE_TRANSFORM = false;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1000;

// TODO: get rid of child canvases since it is not an approach we want to use

export class CanvasRenderer {
  protected rootDiv = document.createElement('div');
  public readonly ll: LL;
  // without transform, so 10 - is 10 pixels
  public readonly llScreenSpace: LL;

  private mouseMode: 'trackpad' | 'mouse' = 'trackpad';

  public readonly quickLL: LL;
  public readonly quickLLScreenSpace: LL;
  public canvas: HTMLCanvasElement;
  private quickCanvas: HTMLCanvasElement;
  private webGlCanvas: HTMLCanvasElement;
  public getHTML() {
    return this.rootDiv;
  }

  public get webGL() {
    return this._webGlLL!
  }

  public ctx: CanvasRenderingContext2D;
  public quickCtx: CanvasRenderingContext2D;
  public $mousePositionScreen = new Observable<V2>();
  public $mousePosition = new Observable<V2>();

  public worldSpaceMatrix = new M3();

  private shiftMatrix = new M3();

  private isViewMatrixStale = true;
  private updated = true;
  private lastViewMatrix = new M3();
  public ratio = window.devicePixelRatio || 1;

  private _webGlLL?: WebGLBatchLL;

  public get viewMatrix() {
    // return this.worldSpaceMatrix;
    if (this.isViewMatrixStale) {
      this.lastViewMatrix = this.shiftMatrix.multiply(this.worldSpaceMatrix);
      // this.lastViewMatrix = this.worldSpaceMatrix.multiply(this.shiftMatrix);
      this.isViewMatrixStale = false;
    }
    return this.lastViewMatrix;
  }

  public get width() {
    return this.canvas.width;
  }

  public get virtualWidth() {
    return this.width / this.ratio;
  }

  public get height() {
    return this.canvas.height;
  }

  public get virtualHeight() {
    return this.height / this.ratio;
  }

  public get viewPortRatio() {
    return this.width / this.height;
  }

  public get viewPort() {
    return new V2(this.width, this.height);
  }

  //public zoom = 0.8;
  public zoom = 1;

  protected center = new V2(0.2, 0.2);
  private dragging = false;

  /**
    * @deprecated use worldToScreen
    */
  public mouseToWorldSpace(x: number, y: number) {
    const m = this.viewMatrix;
    return m.inverse().multiplyV2(new V2(x * this.ratio, y * this.ratio));
  }

  public worldToScreen(p: V2) {
    return this.viewMatrix.multiplyV2(p);
  }

  public screenToWorld(p: V2) {
    return this.viewMatrix.inverse().multiplyV2(p);
  }

  public screenToWorldSpace(x: number, y: number) {
    return this.mouseToWorldSpace(x, y);
  }

  public mousePosition = new V2(0, 0);
  public get mouse() {
    return this.mouseToWorldSpace(this.mousePosition.x, this.mousePosition.y);
  }

  public rectToScreen(r: Rect2D) {
    return new Rect2D(
      this.worldToScreen(r.bottomLeft),
      this.worldToScreen(r.topRight)
    );
  }

  private debugR() {
    const b = new Rect2D(new V2(0.1, 0.1), new V2(0.9, 0.9));
    const { rect, stroke } = this.batch('blue');

    rect(b.bottomLeft, b.topRight);

    stroke();
  }

  public get visibleArea() {
    const m = this.viewMatrix.inverse();
    const p1 = m.multiplyV2(new V2(0, 0));
    const p3 = m.multiplyV2(new V2(this.width, this.height));
    return new Rect2D(p1, p3);
  }

  private setupStyles() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0px';
    this.canvas.style.left = '0px';
    this.canvas.style.zIndex = '1';

    this.quickCanvas.style.position = 'absolute';
    this.quickCanvas.style.top = '0px';
    this.quickCanvas.style.left = '0px';
    this.quickCanvas.style.pointerEvents = 'none';
    this.quickCanvas.style.zIndex = '2';

    this.webGlCanvas.style.position = 'absolute';
    this.webGlCanvas.style.top = '0px';
    this.webGlCanvas.style.left = '0px';
    this.webGlCanvas.style.pointerEvents = 'none';
    this.webGlCanvas.style.zIndex = '3';
    this.webGlCanvas.style.opacity = '0.5';

    this.rootDiv.style.position = 'relative';
    this.rootDiv.style.flex = '1';
  }

  private setupObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.onCanvasResize(width, height);
        this.updateShiftMatrix();
      }
    });

    resizeObserver.observe(this.rootDiv);
  }

  constructor(private readonly simpleEngine: { requestUpdate: () => void }) {
    this.$mousePositionScreen.subscribe(point => this.$mousePosition.next(this.screenToWorld(point)))
    // TODO: make it fullscreen or something
    const canvas = document.createElement('canvas');
    const quickCanvas = document.createElement('canvas');
    const webGlCanvas = document.createElement('canvas');

    this.canvas = canvas;
    this.quickCanvas = quickCanvas;
    this.webGlCanvas = webGlCanvas;
    this.rootDiv.appendChild(canvas);
    this.rootDiv.appendChild(quickCanvas);
    this.rootDiv.appendChild(webGlCanvas);

    this.setupStyles();
    canvas.addEventListener('wheel', this.onMouseScroll, { passive: false });
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMoveForHover);


    const ctx = canvas.getContext('2d')!;
    const quickCtx = quickCanvas.getContext('2d')!;
    this.ctx = ctx;
    this.quickCtx = quickCtx;

    this.ll = new LLSoftware(this.viewMatrix, ctx);
    this.llScreenSpace = new LLSoftware(M3.identity(), ctx);
    this.quickLL = new LLSoftware(this.viewMatrix, quickCtx);
    this.quickLLScreenSpace = new LLSoftware(M3.identity(), quickCtx);

    this._webGlLL = new WebGLBatchLL(webGlCanvas);

    this.updateShiftMatrix();
    this.setupObserver();
  }


  private onMouseDown = () => {
    this.dragging = true;
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent) => {
    const { movementX, movementY } = e;

    if (this.dragging) {
      this.center.x += movementX * this.ratio;
      this.center.y += movementY * this.ratio;
      this.updateShiftMatrix();
    }
  };

  private onMouseMoveForHover = (e: MouseEvent) => {
    const v2 = new V2(e.offsetX * this.ratio, e.offsetY * this.ratio);
    this.mousePosition = v2;
    this.$mousePositionScreen.next(v2);
  };

  private onMouseUp = () => {
    this.dragging = false;
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
  };

  protected updateShiftMatrix() {
    this.shiftMatrix = new M3()
      .transition(this.center.x, this.center.y)
      .scale(this.zoom, this.zoom);

    this.isViewMatrixStale = true;
    this.updated = true;

    this.ll.updateViewMatrix(this.viewMatrix);
    this.quickLL.updateViewMatrix(this.viewMatrix);

    const screenRatio = this.viewPortRatio;

    const c = this.center.byElementDiv(this.viewPort);//.mul(this.zoom);

    // For WebGL, we just need to:
    // 1. Scale from 0-1 to NDC coordinates (-1 to 1)
    // 2. Apply zoom and center (converting center from pixels to normalized coordinates)
    const webGLMatrix = new M3()
      //.transition(this.center.x / this.width * this.ratio, - this.center.y / this.height * this.ratio) // Apply center in normalized coordinates
      //.scale(this.zoom, this.zoom)             // Apply zoom
      .scale(1, -1)
      .transition(-1, -1)                       // Center in NDC space
      .scale(2, 2)                            // Scale from 0-1 to -1 to 1
      .transition(c.x, c.y)
      .scale(this.zoom, this.zoom)
      .scale(1 / screenRatio, 1) // screenRatio)
      .scale(1, -1)
      .transition(0, -1)

    //.transition(-0.5, -0.5)                       // Center in NDC space

    this._webGlLL?.updateViewMatrix(webGLMatrix);

    this.simpleEngine.requestUpdate();
  }

  private handleZoom(e: WheelEvent) {
    const { deltaY } = e;

    const x = e.offsetX * this.ratio;
    const y = e.offsetY * this.ratio;


    const zoomBy = deltaY > 0 ? 1.1 : 1 / 1.1;

    if (this.zoom * zoomBy < 0.8) return;
    if (this.zoom * zoomBy > MAX_ZOOM) return;

    this.zoom *= zoomBy;

    this.center.x = x - (x - this.center.x) * zoomBy;
    this.center.y = y - (y - this.center.y) * zoomBy;

  }

  private onMouseScroll = (e: WheelEvent) => {
    e.preventDefault();

    if (this.mouseMode === 'trackpad') {

      const { deltaX, deltaY } = e;

      //if (Math.abs(deltaX) < 1 && Math.abs(deltaY) > 0) {
      if (Math.floor(deltaX) === deltaX && Math.floor(deltaY) !== deltaY) {
        // likely pitch to zoom

        const x = e.offsetX * this.ratio;
        const y = e.offsetY * this.ratio;


        const ZOOM_COEF = 0.08 * Math.pow(this.zoom, 0.7);
        const zoomBy = deltaY * -ZOOM_COEF;

        if ((this.zoom + zoomBy) < MIN_ZOOM) return;
        if ((this.zoom + zoomBy) > MAX_ZOOM) return;

        const worldBeforeZoom = this.screenToWorld(new V2(x, y));

        this.zoom += zoomBy;
        this.updateShiftMatrix();

        const worldAfterZoom = this.screenToWorld(new V2(x, y));

        const worldDiff = worldAfterZoom.sub(worldBeforeZoom);

        // why we need to divide by viewPortRatio? I have no clue
        this.center.x += worldDiff.x * this.zoom * this.width / this.viewPortRatio;
        this.center.y += -worldDiff.y * this.zoom * this.height;

        // this.center.x = x - (x - this.center.x) * (zoomBy / this.zoom * 10);
        // this.center.y = y - (y - this.center.y) * (zoomBy / this.zoom * 10);


      } else {
        const SPEED_COEF = 2;
        this.center.x += -deltaX * this.ratio * SPEED_COEF;
        this.center.y += -deltaY * this.ratio * SPEED_COEF;
      }
    } else {
      this.handleZoom(e);
    }

    this.updateShiftMatrix();
  };

  public onCanvasResize = (x: number, y: number) => {
    const ratio = this.ratio;
    this.canvas.width = x * ratio;
    this.canvas.height = y * ratio;

    this.quickCanvas.width = x * ratio;
    this.quickCanvas.height = y * ratio;

    this.canvas.style.width = x + 'px';
    this.canvas.style.height = y + 'px';

    this.quickCanvas.style.width = x + 'px';
    this.quickCanvas.style.height = y + 'px';


    this.webGlCanvas.width = x * ratio;
    this.webGlCanvas.height = y * ratio;

    this._webGlLL?.resize(x * ratio, y * ratio);

    this.webGlCanvas.style.width = x + 'px';
    this.webGlCanvas.style.height = y + 'px';

    const wRatio = x / y;
    this.worldSpaceMatrix = new M3()
      .scale((1 / wRatio) * x * ratio, -1 * y * ratio)
      .transition(0, -1);
  };

  protected clearBackground() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = Colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

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

  public prepare() {
    // skip rendering if nothing changed
    if (!this.updated) {
      // return;
    }

    printDebugValue('zoom', this.zoom);

    this.updated = false;

    this.clearBackground();

    this.transformToViewSpace();

    this._webGlLL?.prepareRender();
  }

  public prepareQuick() {
    this.quickCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.quickCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public postQuick(dt: number) {
  }

  public postRender(dt: number) {
    this.debugR();
    this.renderFPS(dt);
    this._webGlLL?.finishRender()
  }

  private renderFPS(dt: number) {
    const { renderText } = this.batchScreenSpace('#333333');
    renderText(
      'FPS: ' + Math.round(1 / (dt / 1000))
      , new V2(10, 20));
  }

  public batch(initialColor: string, lineWidth = 1) {
    return new Batch(this.ll, initialColor, lineWidth);
  }

  public batchScreenSpace(initialColor: string, lineWidth = 1) {
    return new Batch(this.llScreenSpace, initialColor, lineWidth);
  }

  public quickBatch(initialColor: string, lineWidth = 1) {
    return new Batch(this.quickLL, initialColor, lineWidth);
  }

  public quickBatchScreenSpace(initialColor: string, lineWidth = 1) {
    return new Batch(this.quickLLScreenSpace, initialColor, lineWidth);
  }

  public webGlBatch(color?: string) {
    if (!this._webGlLL) {
      throw new Error('Webgl LL is not yet setup');
    }
    return new Batch(this._webGlLL, color || 'black', 1);
  }
}
