import { MicroPlotter, MicroPlotterEngine } from '@/MicroPlotter';
import { Grid } from '@/MicroPlotter/StandardElements/Grid';
import { useCallback } from 'react';
import { DummyElement } from './DummyElement';

export const DraftingTable = () => {

  const onSetup = useCallback((engine: MicroPlotterEngine) => {
    engine.add(new DummyElement());

    engine.add(new Grid());

  }, [])

  return <MicroPlotter onSetup={onSetup} />
}
