export const perf: Record<string, number> = {
};

export const debug: Record<string, string> = {

}

export const perfCounter: Record<string, number> = {
}


export const reportPerf = (name: string, time: number) => {
  perf[name] = time;
};

export const printDebugValue = (name: string, value: number | string) => {
  debug[name] = value.toString();
}

export const incDebugValue = (name: string, delta = 1) => {
  debug[name] = (debug[name] ?? 0) + delta;
}

export const incrPerfCounter = (name: string, delta = 1) => {
  perfCounter[name] = (perfCounter[name] ?? 0) + delta;
}

export const resetPerfCounters = () => {
  Object.keys(perfCounter).forEach(key => {
    perfCounter[key] = 0;
  });
}
