import { MicroPlotter, MicroPlotterEngine } from '@/MicroPlotter';
import { Grid } from '@/MicroPlotter/StandardElements/Grid';
import { useCallback } from 'react';
import { DummyElement } from './DummyElement';
import { MyNode } from './MyNode';
import { MyText } from './MyText';
import { Rect2D, V2 } from '@/Math';

export const DraftingTable = () => {

  const onSetup = useCallback((engine: MicroPlotterEngine) => {
    engine.add(new DummyElement());

    engine.add(new Grid());

    const tempNode = new MyNode(new Rect2D(new V2(0, 0), new V2(0.2, 0.2)));

    engine.add(tempNode);

    engine.add(new MyText(new V2(0.5, 0.5)));

    engine.renderer.$mousePosition.subscribe((position) => {
      tempNode.position = position;
      engine.requestQuickUpdate();
    });

    /*
    engine.activateEditMode({
      mode: 'auto',
      autorerender: true,
      onStart(point: V2) {
        console.log('onStart', point)
      },
      onMove(point: V2) {
        console.log('onMove', point)
      },
      onEnd(point: V2) {
        console.log('onEnd', point)
      }
    })
    */

  }, [])

  return <MicroPlotter onSetup={onSetup} />
}
