import { V2 } from '@/Math/V2';
import { Cell, unwrap } from '../cells/cell';
import { V2$ } from '../cells/v2s';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import { MPElement } from '../render/MPElement';
import { MPText } from './MpText';
import { Angles } from '@/Math/Angles';
import { Shevron } from './LineEnds/Shevron';
import { MPDebugVector } from './MpDebugVector';

import './unitExperimental';

/*     * <- towards
      /
     /
    /______ * <- base
   * <-- cross
*/

export interface AngleOptions {
  color: string;
  radius: number | Cell<number>;
  sizing: 'px' | 'world';
  mode: 'measurement' | 'contraint';
}

const DEFAULT_ANGLE_OPTIONS: AngleOptions = {
  color: 'violet',
  radius: 50,
  sizing: 'px',
  mode: 'measurement',
};

export class MpAngle extends MPElement {
  public cross: V2$;
  public base: V2$;
  public towards: V2$;

  public angle$: Cell<number> = new Cell(0);
  public startAngle$: Cell<number> = new Cell(0);
  public endAngle$: Cell<number> = new Cell(0);
  public middleAngle$: Cell<number> = new Cell(0);
  public startPoint$: V2$ = new V2$(new V2(0, 0));
  public startPerpendicularPoint$: V2$ = new V2$(new V2(0, 0));
  public endPoint$: V2$ = new V2$(new V2(0, 0));
  public endPerpendicularPoint$: V2$ = new V2$(new V2(0, 0));
  public anticlockwise$: Cell<boolean> = new Cell(false);

  public textOffset$: V2$ = new V2$(new V2(0, 0));

  public options: AngleOptions;
  public get radius(): number {
    return this.options.sizing === 'world'
      ? unwrap(this.options.radius)
      : this.engine?.renderer.measureScreenInWorld(
          unwrap(this.options.radius)
        ) ?? 0;
  }

  compute(renderer: CanvasRenderer): void {
    const cross = this.cross.value;
    const base = this.base.value;
    const towards = this.towards.value;

    const angle = V2.angleBetweenPoints(base, cross, towards);

    const ba = cross.sub(base);
    const bc = cross.sub(towards);
    const cross1 = ba.x * bc.y - ba.y * bc.x;
    const anticlockwise = cross1 > 0;

    const startAngle = -ba.angle + Math.PI;
    const endAngle = startAngle + angle * (anticlockwise ? -1 : 1);

    const wouldJumpOut = Math.abs(startAngle - endAngle) < Angles.d30;

    const middleAngle =
      (wouldJumpOut ? -Angles.d30 : 0) + (startAngle + endAngle) / 2;

    const radiusFromPixrls = this.radius; // renderer.measureScreenInWorld(this.radius);

    const pa1 = new V2(radiusFromPixrls, 0).setAngle(-startAngle);
    const startPoint = cross.add(pa1);

    const pa2 = new V2(radiusFromPixrls, 0).setAngle(-endAngle);
    const endPoint = cross.add(pa2);

    const pp1 = new V2(radiusFromPixrls * 2, 0).setAngle(-middleAngle);

    const textOffset = cross.add(pp1);

    const perpendicularDistance = renderer.measureScreenInWorld(20); // Adjust distance as needed

    // Calculate perpendicular point for startPoint
    const startPerpendicular = new V2(-ba.y, ba.x)
      .scale(perpendicularDistance)
      .scale(anticlockwise ? -1 : 1)
      .scale(wouldJumpOut ? -1 : 1);
    const startPerpendicularPoint = startPoint.add(startPerpendicular);

    // Calculate perpendicular point for endPoint
    const endPerpendicular = new V2(-bc.y, bc.x)
      .scale(perpendicularDistance)
      .scale(anticlockwise ? 1 : -1)
      .scale(wouldJumpOut ? -1 : 1);
    const endPerpendicularPoint = endPoint.add(endPerpendicular);

    // Store these points if needed for further use
    this.startPerpendicularPoint$.value = startPerpendicularPoint;
    this.endPerpendicularPoint$.value = endPerpendicularPoint;

    this.textOffset$.value = textOffset;

    this.angle$.value = angle;
    this.anticlockwise$.value = anticlockwise;
    this.startAngle$.value = startAngle;
    this.endAngle$.value = endAngle;
    this.middleAngle$.value = middleAngle;

    this.startPoint$.value = startPoint;
    this.endPoint$.value = endPoint;
  }

  constructor(
    cross: V2$,
    base: V2$,
    towards: V2$,
    options: Partial<AngleOptions> = {}
  ) {
    super();
    this.cross = cross;
    this.base = base;
    this.towards = towards;

    this.options = {
      ...DEFAULT_ANGLE_OPTIONS,
      ...options,
    };
  }

  compose() {
    return [
      new MPText(this.angle$.derive(Angles.prettyPrint), this.textOffset$, {
        align: 'center',
      }),

      new Shevron(this.startPoint$, this.startPerpendicularPoint$, {
        sizing: 'px',
        size: 10,
      }),

      new Shevron(this.endPoint$, this.endPerpendicularPoint$, {
        sizing: 'px',
        size: 10,
      }),
    ];
  }

  render(renderer: CanvasRenderer): void {
    const rr = this.radius;
    const { arc, stroke, renew, pss, magicArc } = renderer.batch(this.options.color, 1);

    const startAngle = this.startAngle$.value;
    const anticlockwise = this.anticlockwise$.value;
    const endAngle = this.endAngle$.value;

    const startOffset =
      Math.abs(startAngle - endAngle) < Angles.d30 ? Angles.d30 : 0;

    if (this.options.mode === 'contraint') {
      magicArc(
        this.cross.value,
        rr,
        startAngle + Math.PI,
        endAngle + Math.PI,
        anticlockwise
      )
      renew(this.options.color, 4, {
        dashPattern: [],
      });
      arc(
        this.cross.value,
        rr,
        startAngle,
        endAngle,
        anticlockwise
      );
      stroke();
    } else {
      arc(
        this.cross.value,
        rr,
        startAngle - startOffset * (anticlockwise ? 0 : 1),
        endAngle - startOffset * (anticlockwise ? 1 : 0),
        anticlockwise
      );
      stroke();
    }
  }
}
