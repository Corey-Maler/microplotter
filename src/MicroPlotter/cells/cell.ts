export class Cell<T> {
  private subscribers: Set<(value: T) => void> = new Set();
  public _value: T;
  public isDependent = false;
  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    this._value = value;
    for (const callback of this.subscribers) {
      callback(value);
    }
  }

  constructor(value: T, isDependent = false) {
    this._value = value;
    this.isDependent = isDependent;
  }

  public adopt(another: Cell<T> | T) {
    if (another instanceof Cell) {
      this._value = another.value;
      another.subscribe((newValue) => {
        this.value = newValue;
      });
      this.isDependent = true;
    } else {
      this._value = another;
    }
  }

  public derive<G>(fn: (val: T) => G): Cell<G> {
    // return new Cell(this.value);
    const c = new Cell(fn(this.value), true);

    this.subscribe((newValue) => {
      c.value = fn(newValue);
    });

    return c;
  }

  public subscribe(callback: (value: T) => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public unsubscribe(callback: (value: T) => void): void {
    this.subscribers.delete(callback);
  }

  static combine(...v2s: Cell<any>[]): Cell<any> {
    const c = new Cell<any[]>(v2s.map((v2) => v2.value));
    const upd = () => {
      const values = v2s.map((v2) => v2.value);
      c.value = values;
    };
    for (const v2 of v2s) {
      v2.subscribe(upd);
    }
    return c;
  }
}

export const batch = (cb: any) => {
  cb();
};

export const unwrap = <T>(cell: T | Cell<T>): T => {
  if (cell instanceof Cell) {
    return cell.value;
  }
  return cell;
};
