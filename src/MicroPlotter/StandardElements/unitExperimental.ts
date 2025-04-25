abstract class Unit {
  public add(other: Unit) {
    if (other instanceof this.constructor && !(this instanceof PU)) {
      return new this.constructor(this.value + other.value);
    }
    return new PU((convertion) => {
      return this.compute(convertion) + other.compute(convertion);
    });
  }

  public abstract compute(convertion: number): number;
}

class PU extends Unit {
  public constructor(private factory: (convertion: number) => number) {
    super();
  }
  public compute(convertion: number) {
    return this.factory(convertion);
  }
}

class PX extends Unit {
  constructor(public value: number) {
    super();
  }
  public compute(convertion: number) {
    return this.value * convertion;
  }
}

class PM extends Unit {
  constructor(public value: number) {
    super();
  }
  public compute(convertion: number) {
    return this.value;
  }
}

const px = (val: number) => new PX(val);
const m = (val: number) => new PM(val);

const res = m(4).add(px(1)).add(m(2)).add(px(4)).add(px(1).add(m(1))).compute(3)

console.log(res);
