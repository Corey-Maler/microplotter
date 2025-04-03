import { MicroPlotter, MicroPlotterEngine } from "@/MicroPlotter";
import { Grid } from "@/MicroPlotter/StandardElements/Grid";
import { useCallback } from "react";
import { DummyElement } from "./DummyElement";
import { MyNode } from "./MyNode";
import { MyText } from "./MyText";
import { Rect2D, V2 } from "@/Math";

export const DraftingTable = () => {
  const onSetup = useCallback((engine: MicroPlotterEngine) => {
    engine.add(new DummyElement());

    engine.add(new Grid());

    let tempNode: MyNode | null = new MyNode(
      new Rect2D(new V2(0, 0), new V2(0.2, 0.2)),
    );

    engine.add(tempNode);

    engine.add(new MyText(new V2(0.5, 0.5)));

    // engine.renderer.$mousePosition.subscribe((position) => {
    //   tempNode.position = position;
    //   engine.requestQuickUpdate();
    // });

    tempNode = null;
    const cancelEditMode = engine.activateEditMode({
      mode: "auto",
      autorerender: true,
      onStart(point: V2) {
        console.log("onStart", point);
        tempNode = new MyNode(new Rect2D(point, point.add(new V2(0.1, 0.1))));
        engine.add(tempNode);
      },
      onMove(point: V2) {
        console.log("onMove", point);
        if (tempNode) {
          tempNode.rect.v2 = point;
        }
      },
      onClick(point: V2) {
        console.log("onClick", point);
        if (tempNode) {
          tempNode.rect.v2 = point;
          cancelEditMode();
          tempNode = null;
        }
      },
      onEnd(point: V2) {
        console.log("onEnd", point);
        if (tempNode) {
          tempNode.rect.v2 = point;
          cancelEditMode();
          tempNode = null;
        }
      },
    });
  }, []);

  return <MicroPlotter onSetup={onSetup} />;
};
