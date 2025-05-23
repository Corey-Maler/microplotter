import { resetPerfCounters } from '../../components/Perf/model';
import { CanvasRenderer } from '../render/CanvasRenderer';
import type { MPElement } from '../render/MPElement';

export class MicroPlotterEngine {
  public renderer: CanvasRenderer;
  public running = false;
  public lastUpdate = Date.now();
  public children: MPElement[] = [];

  constructor() {
    this.renderer = new CanvasRenderer(this);
  }

  public activateEditMode = (props: any) => {
    return this.renderer.mouseHandlers.activateEditMode(props);
  };

  public add(element: MPElement) {
    element.setup(this);
    this.children.push(element);
  }

  public destroy() {
    this.children = [];
    // todo: cleanup
  }

  public getHtmlElements() {
    return this.renderer.getHTML();
  }

  private updateScheduled: false | 'quick' | 'full' = false;

  public requestQuickUpdate() {
    this.requestUpdate('quick');
  }

  public requestUpdate(type: 'quick' | 'full' = 'full') {
    if (this.updateScheduled) {
      // promote to full if requested
      if (type === 'full') {
        this.updateScheduled = 'full';
      }
      return;
    }

    this.updateScheduled = type;
    window.requestAnimationFrame(() => {
      this.update();
      this.updateScheduled = false;
      //this.renderCycle();
    });
  }

  private renderCycle = () => {
    window.requestAnimationFrame(() => {
      this.update();
      this.renderCycle();
    });
  };

  public run() {
    if (this.running) {
      return;
    }
    this.running = true;
    //this.renderCycle();
    this.update();
  }

  public stop() {
    this.running = false;
  }

  update = () => {
    const now = Date.now();
    const dt = now - this.lastUpdate;
    this.lastUpdate = now;
    this.children.forEach((child) => child.doUpdate(dt));
    resetPerfCounters();
    this.render(dt);
  };

  private render(dt: number) {
    this.renderer.prepare();
    this.children.forEach((child) => child.doRender(this.renderer));
    this.renderer.postRender(dt);
  }
}
