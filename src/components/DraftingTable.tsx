import { Rect2D, V2 } from '@/Math';
import { MicroPlotter, type MicroPlotterEngine } from '@/MicroPlotter';
import { Grid, GridMode } from '@/MicroPlotter/StandardElements/Grid';
import { MPLine } from '@/MicroPlotter/StandardElements/MpLine';
import { MPText } from '@/MicroPlotter/StandardElements/MpText';
import { useCallback } from 'react';
import { DummyElement } from './DummyElement';
// import { MyNode } from "./MyNode";
import { MyText } from './MyText';
import { MPAttractor } from '@/MicroPlotter/StandardElements/MpAttractor';
import { V2$ } from '@/MicroPlotter/cells/v2s';
import { MpAngle } from '@/MicroPlotter/StandardElements/MpAngle';
import { MpArcGuide } from '@/MicroPlotter/StandardElements/MpArcGuide';

export const DraftingTable = () => {
  const onSetup = useCallback((engine: MicroPlotterEngine) => {
    engine.add(new DummyElement());

    // Create a grid with higher density (more detailed grid lines)
    engine.add(new Grid(1, GridMode.DOTS));
    // engine.add(new Grid(1, GridMode.LINES));

    let tempNode: MPLine | null = null;


    const m1Point = new V2$(new V2(0.7, 0.4));
    const m2Point = new V2$(new V2(0.8, 0.5));
    const m3Point = new V2$(new V2(0.8, 0.4));

    engine.addAttractor(new MPAttractor(m2Point, { color: 'gray' }));

    engine.add(new MPLine(m1Point, m2Point));
    engine.add(new MPLine(m1Point, m3Point));

    engine.add(new MpAngle(m1Point, m2Point, m3Point, {
      color: 'green',
      mode: 'contraint',
      radius: m1Point.distanceTo$(m2Point),
      sizing: 'world',
    }));

    const midPoint = new V2$(new V2(0.1, 0.4));
    const midPoint1 = new V2$(new V2(0.4, 0.9));
    const midPoint2 = new V2$(new V2(0.7, 0.6));
    const midPoint3 = new V2$(new V2(0.3, 0.2));
    const attractor2 = new MPAttractor(midPoint, { color: 'red' });
    engine.addAttractor(attractor2);
    engine.addAttractor(new MPAttractor(midPoint1, { color: 'blue' }));
    engine.addAttractor(new MPAttractor(midPoint2, { color: 'green' }));
    engine.addAttractor(new MPAttractor(midPoint3, { color: 'yellow' }));

    const angleLine1 = new MPLine(midPoint, midPoint1);
    const angleLine2 = new MPLine(midPoint1, midPoint2);
    const angleLine3 = new MPLine(midPoint2, midPoint3);
    const angleLine4 = new MPLine(midPoint3, midPoint);


    const angl = new MpAngle(angleLine1._p2, angleLine1._p1, angleLine2._p2);
    const angl2 = new MpAngle(angleLine2._p2, angleLine2._p1, angleLine3._p2);
    const angl3 = new MpAngle(angleLine3._p2, angleLine3._p1, angleLine4._p2);
    const angl4 = new MpAngle(angleLine4._p2, angleLine4._p1, angleLine1._p2);

    engine.add(angleLine1);
    engine.add(angleLine2);
    engine.add(angleLine3);
    engine.add(angleLine4);
    engine.add(angl);
    engine.add(angl2);
    engine.add(angl3);
    engine.add(angl4);


    const text = new MPText('Hello world', new V2(0.5, 0.8));
    engine.add(text);

    engine.add(new MyText(new V2(0.5, 0.5)));

    const linePreview = new MPLine(new V2(0.4, 0.1), new V2(0.8, 0.2));
    engine.add(linePreview);

    linePreview.tSelect();
    linePreview.showLenght = true;

    // engine.renderer.$mousePosition.subscribe((position) => {
    //   tempNode.position = position;
    //   engine.requestQuickUpdate();
    // });

    const attractor = new MPAttractor(new V2$(new V2(0.4, 0.5)), { color: 'red' });
    engine.addAttractor(attractor);

    const tryEditMode = false;
    if (tryEditMode) {
      tempNode = null;
      const cancelEditMode = engine.activateEditMode({
        mode: 'clicks',
        autorerender: true,
        onStart(point: V2) {
          tempNode = new MPLine(point, point, { showMiddlePoint: true });
          tempNode.showLenght = true;
          engine.add(tempNode);
        },
        onMove(point: V2) {
          if (tempNode) {
            tempNode.p2 = point;
          }
        },
        onClick(point: V2) {
          if (tempNode) {
            tempNode.p2 = point;
            tempNode.showLenght = false;
            // cancelEditMode();
            // tempNode = null;
            tempNode = new MPLine(point, point, { showMiddlePoint: true });
            tempNode.showLenght = true;
            engine.add(tempNode);
          }
        },
        onEnd(point: V2) {
          if (tempNode) {
            // tempNode.rect.v2 = point;
            cancelEditMode();
            tempNode = null;
          }
        },
      });
    }
  }, []);

  return <MicroPlotter onSetup={onSetup} />;
};
