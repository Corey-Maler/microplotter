import { V2 } from "@/Math";
import type { MicroPlotterEngine } from "../engine/engine";
import type { CanvasRenderer } from "./CanvasRenderer";
import { Cell } from "../cells/cell";
import { Children } from "react";

export interface Constraint {
  value: string;
  fn: () => any;
}

export abstract class MPElement {
  public abstract testHover: ((p: V2, within: number) => boolean) | undefined;
  public abstract onHover?: () => void;
  public abstract onBlur?: () => void;

  public rotation: number | Cell<number> = 0;

  protected hovered = false;
  public updateHover(point: V2, radius: number) {
    if (this.testHover) {
      const nowHovered = this.testHover(point, radius);
      if (this.hovered !== nowHovered) {
        this.engine?.requestQuickUpdate()
      }
      if (nowHovered && !this.hovered && this.onHover) {
        this.onHover()
      }
      if (!nowHovered && this.hovered && this.onBlur) {
        this.onBlur()
      }
      this.hovered = nowHovered;
    }
  }

  // Origin by default should not be set from the outside of a component
  protected _origin: V2 = new V2(0, 0);
  public get origin(): V2 {
    return this._origin;
  }

  protected _engine?: MicroPlotterEngine;
  protected _parent?: MPElement;
  protected get engine(): MicroPlotterEngine | undefined {
    return this._engine ?? this._parent?.engine;
  }

  protected children?: MPElement[];

  setup(engine: MicroPlotterEngine) {
    this._engine = engine;

    this.tryCompose();

    // biome-ignore lint/complexity/noForEach: <explanation>
    this.children?.forEach((child) => {
      child.setup(engine);
    });
  }

  private tryCompose() {
    if (this.compose) {
      const children = this.compose();
      if (children) {
        if (this.children) {
          this.children.push(...children);
        } else {
          this.children = children;
        }
      }
    }
  }

  public constraints: Constraint[] = [];

  public constrain(value: string, fn: () => any) {
    this.constraints.push({ value, fn });
  }

  public appendChild(child: MPElement) {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
    child._parent = this;
  }

  public removeChild(child: MPElement) {
    if (!this.children) {
      return;
    }
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  public doUpdate(dt: number, renderer: CanvasRenderer) {
    // constraints for now goes from up to down, but
    // updates goes from down to up

    if (this.compute) {
      this.compute(renderer);
    }

    this.recalculateConstraints();
    if (this.children) {
      for (const child of this.children) {
        child.doUpdate(dt, renderer);
      }
    }
    this.update(dt);
  }

  protected recalculateConstraints() {
    // Implement constraint calculation logic here

    this.constraints.forEach((constraint) => {
      const newValue = constraint.fn();
      this[constraint.value] = newValue;
    });
  }

  public update(dt: number) {}

  public doRender(renderer: CanvasRenderer) {
    if (this.children) {
      this.children.forEach((child) => child.doRender(renderer));
    }

    renderer.prepareScreen(this);
    this.render(renderer);
    renderer.resetScreen(this);
  }

  render(renderer: CanvasRenderer) {
    throw new Error("Method not implemented.");
  }
}
