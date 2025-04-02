export class Progress {
  start: number;
  total: number = 0;
  slowest: number = 0;
  current: number = 0;
  currentIteration: number = 0;
  percentage: number = 0;
  constructor(private label: string, private iterations: number, private showPerc = 10) {
    this.start = performance.now();
    this.current = this.start;
  }

  public grow(its: number) {
    this.iterations += its;
  }

  private printCurrentPercentage() {
    const avg = (performance.now() - this.start) / this.currentIteration;

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${this.label}: ${(this.percentage * 100).toFixed(2)}% Processed ${this.currentIteration} out of ${this.iterations}. Avg time per iteration: ${(avg).toFixed(2)}ms (${(1 / avg * 1000).toFixed(2)} per second)`);
  }

  iteration() {

    this.total++;
    const now = performance.now();
    const dt = now - this.current;
    this.current = now;
    if (dt > this.slowest) {
      this.slowest = dt;
    }

    this.currentIteration++;
    const pr = this.showPerc / 100;
    if ((this.currentIteration / this.iterations) > this.percentage + pr) {
      this.percentage += pr;
      this.printCurrentPercentage();
    }
  }

  end() {
    const dt = performance.now() - this.start;
    const avg = dt / this.total;
    process.stdout.write('\n');
    console.log(
      `${this.label}: done in ${dt.toFixed(2)}ms. ${avg.toFixed(4)} average. ${(
        (1 / avg) *
        1000
      ).toFixed(2)} per second. Slowest ${this.slowest.toFixed(2)}ms`
    );
  }
}
