import { V2 } from "@/Math";
import { Cell } from "./cell";

export class V2$ extends Cell<V2> {
  /**
   * temporary attachment for attractor
   */
  public __attractor?: any;
  constructor(value?: V2, dep = false) {
    super(value ?? new V2(0, 0), dep);
  }

  update(value: V2) {
    this.value = value;
  }

  add$(other: V2$): V2$ {
    return V2$.fromCell(
      V2$.combine(this, other).derive((val) => val[0].add(val[1])),
    );
    // return this.deriveV2$(val => val.add(other.value));
  }

  angleTo$(other: V2$) {
    return V2$.combine(this, other).derive(([v1, v2]) => v1.angleTo(v2));
  }

  scale$(factor: number): V2$ {
    return this.deriveV2$((val) => val.scale(factor));
  }

  public deriveV2$(fn: (val: V2) => V2): V2$ {
    const c = new V2$(fn(this.value), true);
    this.subscribe((newValue) => {
      c.value = fn(newValue);
    });
    return c;
  }

  static combine(...v2s: V2$[]): Cell<V2[]> {
    const c = new Cell<V2[]>(v2s.map((v2) => v2.value));
    const upd = () => {
      const values = v2s.map((v2) => v2.value);
      c.value = values;
    };
    for (const v2 of v2s) {
      v2.subscribe(upd);
    }
    return c;
  }

  static fromCell(cell: Cell<V2>) {
    const c = new V2$(cell.value, true);
    cell.subscribe((newValue) => {
      c.value = newValue;
    });
    return c;
  }
}
