import { MicroPlotter, MicroPlotterEngine } from "@/MicroPlotter";
import { Grid } from "@/MicroPlotter/StandardElements/Grid";
import { useCallback } from "react";
import { DummyElement } from "./DummyElement";
// import { MyNode } from "./MyNode";
import { MyText } from "./MyText";
import { Rect2D, V2 } from "@/Math";
import { MPLine } from "@/MicroPlotter/StandardElements/MpLine";
import { MPText } from "@/MicroPlotter/StandardElements/MpText";

export const DraftingTable = () => {
  const onSetup = useCallback((engine: MicroPlotterEngine) => {
    engine.add(new DummyElement());

    // Create a grid with higher density (more detailed grid lines)
    engine.add(new Grid(1));

    let tempNode: MPLine | null = null;

    // engine.add(tempNode);

    const text = new MPText("Hello world", new V2(0.5, 0.8))
    engine.add(text);

    engine.add(new MyText(new V2(0.5, 0.5)));

    engine.add(new MPLine(new V2(0.4, 0.1), new V2(0.9, 0.9)));

    // engine.renderer.$mousePosition.subscribe((position) => {
    //   tempNode.position = position;
    //   engine.requestQuickUpdate();
    // });

    tempNode = null;
    const cancelEditMode = engine.activateEditMode({
      mode: "clicks",
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
  }, []);

  return <MicroPlotter onSetup={onSetup} />;
};
