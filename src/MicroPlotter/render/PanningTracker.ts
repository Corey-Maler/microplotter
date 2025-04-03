import { M3, V2 } from "@/Math";
import { ViewPort } from "./ViewPort";

export class PanningTracker {
  public center = new V2(0.2, 0.2);
  public zoom = 1;

  public MAX_ZOOM = 1000;
  public MIN_ZOOM = 0.8;

  constructor(private viewPortTracker: ViewPort, private requestUpdate: () => void) {
    this.updateWorldSpaceMatrix();
    this.updateShiftMatrix();
  }

  public worldSpaceMatrix = new M3();

  private isViewMatrixStale = true;
  private lastViewMatrix = new M3();

  public webGLMatrix = new M3();

  private shiftMatrix = new M3();

  public screenToWorld(p: V2) {
    return this.viewMatrix.inverse().multiplyV2(p);
  }

  public moveCenter(x: number, y: number) {
    this.center.x = x;
    this.center.y = y;

    this.updateShiftMatrix();
  }

  public moveCenterBy(x: number, y: number) {
    this.center.x += x;
    this.center.y += y;

    this.updateShiftMatrix();
  }

  public get viewMatrix(): M3 {
    // return this.worldSpaceMatrix;
    if (this.isViewMatrixStale) {
      this.lastViewMatrix = this.shiftMatrix.multiply(this.worldSpaceMatrix);
      // this.lastViewMatrix = this.worldSpaceMatrix.multiply(this.shiftMatrix);
      this.isViewMatrixStale = false;
    }
    return this.lastViewMatrix;
  }

  public recalculate() {
    this.updateShiftMatrix()
  }

  protected updateShiftMatrix() {
      this.shiftMatrix = new M3()
        .transition(this.center.x, this.center.y)
        .scale(this.zoom, this.zoom);

      this.isViewMatrixStale = true;

      const screenRatio = this.viewPortTracker.viewPortRatio;

      const c = this.center.byElementDiv(this.viewPortTracker.viewPort);//.mul(this.zoom);

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

      // this._webGlLL?.updateViewMatrix(webGLMatrix);
      this.webGLMatrix = webGLMatrix;

      // this.simpleEngine.requestUpdate();
      this.requestUpdate();
    }

    public updateWorldSpaceMatrix() {
      const width = this.viewPortTracker.width;
      const height = this.viewPortTracker.height;
      const wRatio = this.viewPortTracker.viewPortRatio;
      this.worldSpaceMatrix = new M3()
        .scale((1 / wRatio) * width, -1 * height)
        .transition(0, -1);
    }
}
