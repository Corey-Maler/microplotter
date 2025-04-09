export class Cell<T> {
  private subscribers: Set<(value: T) => void> = new Set();
  public _value: T;
  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    this._value = value;
    for (const callback of this.subscribers) {
      callback(value);
    }
  }

  constructor(value: T) {
    this._value = value;
  }

  public adopt(another: Cell<T> | T) {
    if (another instanceof Cell) {
      this._value = another.value;
      another.subscribe((newValue) => {
        this.value = newValue;
      });
    } else {
      this._value = another;
    }
  }

  public derive<G>(fn: (val: T) => G): Cell<G> {
    // return new Cell(this.value);
    const c = new Cell(fn(this.value));

    this.subscribe((newValue) => {
      c.value = fn(newValue);
    })

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
}

export const batch = (cb: any) => {
  cb();
}

export const unwrap = <T>(cell: T | Cell<T>): T => {
  if (cell instanceof Cell) {
    return cell.value;
  }
  return cell;
}
