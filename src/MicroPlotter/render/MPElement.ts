import { V2 } from '@/Math';
import type { MicroPlotterEngine } from '../engine/engine';
import type { CanvasRenderer } from './CanvasRenderer';

export interface Constraint {
  value: string;
  fn: () => any;
}

export abstract class MPElement {
  public rotation = 0;
  public origin: V2 = new V2(0, 0);
  protected _engine?: MicroPlotterEngine;
  protected _parent?: MPElement;
  protected get engine(): MicroPlotterEngine | undefined {
    return this._engine ?? this._parent?.engine;
  }

  protected children?: MPElement[];

  setup(engine: MicroPlotterEngine) {
    this._engine = engine;
  }

  public constraints: Constraint[] = [];

  public constrain(value: string, fn: () => any) {
    this.constraints.push({ value, fn });
  }

  public appendChild(child: MPElement) {
    if (!this.children) {
      this.children = [];
    }
    console.log('SETUP! child', this.engine);
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

  public doUpdate(dt: number) {
    // constraints for now goes from up to down, but
    // updates goes from down to up
    this.recalculateConstraints();
    if (this.children) {
      this.children.forEach((child) => child.doUpdate(dt));
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
    throw new Error('Method not implemented.');
  }
}
