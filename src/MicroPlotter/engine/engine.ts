import { V2 } from "@/Math";
import { resetPerfCounters } from "../../components/Perf/model";
import { CanvasRenderer } from "../render/CanvasRenderer";
import type { MPElement } from "../render/MPElement";
import { MPAttractor } from "../StandardElements/MpAttractor";
import { V2$ } from "../cells/v2s";

export class MicroPlotterEngine {
  public renderer: CanvasRenderer;
  public running = false;
  public lastUpdate = Date.now();
  public children: MPElement[] = [];

  public attractors: MPAttractor[] = [];

  constructor() {
    this.renderer = new CanvasRenderer(this);
    // this.renderer.$mousePosition.subscribe(this.checkAttractors)
    // this.renderer.mouseHandlers.
    // temporary
    let hovered: MPAttractor | undefined = undefined;
    this.renderer.mouseHandlers.activateItemDragMode({
      onHover: (p) => this.checkAttractors(p),
      onMove: (p) => {
        this.requestUpdate();
        if (hovered) {
          hovered.position.update(p);
        }
      },
      onDragStart: (p) => {
        hovered = this.findAttractor(p);
      },
      onDragEnd: (p) => {
        hovered = this.findAttractor(p);
      },
    });
  }

  public checkAttractors = (p: V2) => {
    const radius = 10;
    const r = this.renderer.measureScreenInWorld(radius);
    for (const att of this.attractors) {
      att.updateHover(p, r);
    }
  };

  public findAttractor = (p: V2) => {
    const radius = 10;
    const r = this.renderer.measureScreenInWorld(radius);
    return this.attractors.find((att) => att.testHover(p, r));
  };

  public activateEditMode = (props: any) => {
    return this.renderer.mouseHandlers.activateEditMode(props);
  };

  public addAttractor(attractor: MPAttractor) {
    this.attractors.push(attractor);
    attractor.setup(this);
  }

  public addAttractorFor(point: V2$) {
    if (!point.__attractor) {
      const att = new MPAttractor(point);
      this.addAttractor(att);
      point.__attractor = att;
    }
  }

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

  private updateScheduled: false | "quick" | "full" = false;

  public requestQuickUpdate() {
    this.requestUpdate("quick");
  }

  public requestUpdate(type: "quick" | "full" = "full") {
    if (this.updateScheduled) {
      // promote to full if requested
      if (type === "full") {
        this.updateScheduled = "full";
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
    this.attractors.forEach((att) => att.doUpdate(dt, this.renderer));
    this.children.forEach((child) => child.doUpdate(dt, this.renderer));
    resetPerfCounters();
    this.render(dt);
  };

  private render(dt: number) {
    this.renderer.prepare();
    this.children.forEach((child) => child.doRender(this.renderer));
    this.attractors.forEach((att) => att.doRender(this.renderer));
    this.renderer.postRender(dt);
  }
}
