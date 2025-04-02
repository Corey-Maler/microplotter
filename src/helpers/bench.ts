export class Bench {
    start: number;
    total: number = 0;
    slowest: number = 0;
    current: number = 0;
    constructor(private label: string) {
        this.start = performance.now();
        this.current = this.start;
    }

    iteration() {
        this.total++;
        const now = performance.now();
        const dt = now - this.current;
        this.current = now;
        if (dt > this.slowest) {
            this.slowest = dt;
        }
    }

    end() {
        const dt =  performance.now() - this.start;
        const avg = dt / this.total;
        console.log(`${this.label}: done in ${dt.toFixed(2)}ms. ${avg.toFixed(4)} average. ${(1 / avg * 1000).toFixed(2)} per second. Slowest ${this.slowest.toFixed(2)}ms`);
    }
}