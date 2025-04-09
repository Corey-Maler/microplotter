import { useCallback, useRef } from 'react';
import { MicroPlotterEngine } from '../engine/engine';

export interface MicroPlotterProps {
  onSetup: (engine: MicroPlotterEngine) => void;
}

export const MicroPlotter = ({ onSetup }: MicroPlotterProps) => {
  const prevEngine = useRef<MicroPlotterEngine | null>(null);
  const prevNode = useRef<HTMLDivElement | null>(null);

  const canvasContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        const engine = new MicroPlotterEngine();
        node.appendChild(engine.getHtmlElements());
        prevEngine.current = engine;
        prevNode.current = node;

        engine.run();

        onSetup(engine);
      } else {
        prevEngine.current?.destroy();
        if (prevNode.current) {
          prevNode.current.innerHTML = '';
        }
      }
    },
    [onSetup],
  );

  return (
    <div
      style={{ flex: '1 1 auto', display: 'flex' }}
      className="microplotter-attachment"
      ref={canvasContainerRef}
    ></div>
  );
};
