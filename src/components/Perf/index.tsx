import { useEffect, useState } from 'react';
import { debug, perf, perfCounter } from './model';
import './perf.css';

const COLOURS = [
  '#FBF5DD',
  '#A6CDC6',
  '#3489a3',
  '#DDA853',
  '#257180',
  '#F2E5BF',
  '#FD8B51',
  '#CB6040',
  '#A02334',
  '#624E88',
  '#CB80AB',
  '#1B1A17',
];

export const PerfDisplay = () => {
  const [s, ss] = useState(0);
  useEffect(() => {
    const i = setInterval(() => {
      ss((s) => s + 1);
    }, 200);
    return () => {
      clearInterval(i);
    };
  }, [s]);
  const entitis = Object.entries(perf);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const total = entitis.reduce((acc, [_, value]) => acc + value, 0);
  let left = 0;
  return (
    <div className="perf">
      <div className="bar">
        {entitis.map(([key, value], i) => {
          const width = (value / total) * 100;
          const l = left;
          left += width;
          return (
            <div
              key={key}
              className="line"
              style={{
                left: l + '%',
                width: width + '%',
                background: COLOURS[i],
              }}
            />
          );
        })}
      </div>
      <div>total {total.toFixed(2)}ms</div>
      <div className="labels">
        {entitis.map(([key, value], i) => (
          <div className="label" key={key}>
            <div className="dot" style={{ background: COLOURS[i] }} />
            {key} {value.toFixed(2)}ms
          </div>
        ))}
      </div>
      <div className="labels">
        {Object.entries(debug).map(([key, value]) => (
          <div key={key}>
            {key} {value}
          </div>
        ))}
      </div>
      <div className="labels">
        {Object.entries(perfCounter).map(([key, value]) => (
          <div key={key}>
            {key} {value}
          </div>
        ))}
      </div>
    </div>
  );
};
