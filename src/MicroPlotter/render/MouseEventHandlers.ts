import { V2 } from "@/Math";
import { PanningTracker } from "./PanningTracker";
import { ViewPort } from "./ViewPort";
import { Observable } from "@/utils/observable";

export class MouseEventHandlers {
  private mouseMode: "trackpad" | "mouse" = "trackpad";
  public mousePosition: V2 = new V2(0, 0);
  public $mousePositionScreen: Observable<V2> = new Observable();
  public $mousePositionWorld: Observable<V2> = new Observable();

  private $clicksScreen: Observable<V2> = new Observable();
  private $clicksWorld: Observable<V2> = new Observable();
  private dragging = false; // todo: rename to "panning" or something

  private editMode = false;

  // maybe switch to RXJS?
  private mouseDraggingFrom: V2 | null = null;
  private $mouseDraggingFromScreen: Observable<V2> = new Observable();
  private $mouseUpScreen: Observable<V2> = new Observable();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly panningTracker: PanningTracker,
    private readonly viewPortTracker: ViewPort,
    private readonly requestUpdate: () => void,
  ) {
    this.setupEventListeners();

    this.$mousePositionScreen.subscribe((point) =>
      this.$mousePositionWorld.next(panningTracker.screenToWorld(point)),
    );

    this.$clicksScreen.subscribe((point) =>
      this.$clicksWorld.next(panningTracker.screenToWorld(point)),
    );
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("wheel", this.onMouseScroll, {
      passive: false,
    });
    this.canvas.addEventListener("click", this.onClick);
  }

  public activateEditMode = (props: {
    onClick?: (point: V2) => void;
    onMove?: (point: V2) => void;
    onEnd: (point: V2) => void;
    onStart: (point: V2) => void;
    mode: "auto" | "clicks" | "drag&drop";
    autorerender?: boolean;
  }) => {
    this.dragging = false; // not sure, but probably should be this
    this.editMode = true;
    const subscriptions = [] as (() => void)[];

    const { onClick, onMove, onEnd, onStart, mode, autorerender } = props;

    if (autorerender) {
      subscriptions.push(
        this.$mousePositionWorld.subscribe(() => {
          this.requestUpdate();
        }),
      );
    }

    let firstClick = true;
    const unsubscribeFromClicks = this.$clicksWorld.subscribe((point: V2) => {
      onClick?.(point);

      if (firstClick) {
        firstClick = false;
        onStart?.(point);

        if (onMove) {
          subscriptions.push(this.$mousePositionWorld.subscribe(onMove));
        }
      }
    });

    subscriptions.push(unsubscribeFromClicks);

    if (mode === "drag&drop" || mode === "auto") {
      const unsubscribeDragging = this.$mouseDraggingFromScreen.subscribe((point) => {
        unsubscribeFromClicks();
        unsubscribeDragging();
        onStart?.(this.panningTracker.screenToWorld(point));


        if (onMove) {
          const moveUnsubscribe = this.$mousePositionWorld.subscribe(onMove);
          subscriptions.push(moveUnsubscribe);
        }

        if (onEnd) {
          const mouseUpUnsubscribe = this.$mouseUpScreen.subscribe((point) => {
            onEnd(this.panningTracker.screenToWorld(point));
          });
          subscriptions.push(mouseUpUnsubscribe);
        }
      });

      subscriptions.push(unsubscribeDragging);

    }

    return () => {
      this.editMode = false;
      subscriptions.forEach((sub) => sub());
    };
  };

  onClick = (event: MouseEvent) => {
    const v2 = this.event2V(event);
    this.$clicksScreen.next(v2);
  };

  onMouseDown = (event: MouseEvent) => {
    this.mouseDraggingFrom = this.event2V(event);
    // Handle mouse down event
    if (!this.editMode) {
      // Handle edit mode specific logic
      this.dragging = true;
    }
  };

  onMouseMove = (event: MouseEvent) => {
    // Handle mouse move event
    const v2 = this.event2V(event);
    this.mousePosition = v2;
    this.$mousePositionScreen.next(v2);
    const { movementX, movementY } = event;

    if (this.mouseDraggingFrom?.withinDistance(v2, 10)) {
      console.log("dragging mode, not clicks mode");
      this.$mouseDraggingFromScreen.next(v2);
    }

    if (this.dragging) {
      this.panningTracker.moveCenterBy(
        movementX * this.viewPortTracker.HDPI,
        movementY * this.viewPortTracker.HDPI,
      );
    }
  };

  onMouseUp = (event: MouseEvent) => {
    this.dragging = false;

    if (this.mouseDraggingFrom) {
      this.$mouseUpScreen.next(this.event2V(event));
    }

    this.mouseDraggingFrom = null;
    // Handle mouse up event
  };

  private event2V(event: MouseEvent) {
    const v2 = new V2(
      event.offsetX * this.viewPortTracker.HDPI,
      event.offsetY * this.viewPortTracker.HDPI,
    );
    return v2;
  }

  private handleZoom(e: WheelEvent) {
    const { deltaY } = e;

    const ratio = this.viewPortTracker.HDPI;

    const x = e.offsetX * ratio;
    const y = e.offsetY * ratio;

    const zoomBy = deltaY > 0 ? 1.1 : 1 / 1.1;

    if (this.panningTracker.zoom * zoomBy < this.panningTracker.MIN_ZOOM)
      return;
    if (this.panningTracker.zoom * zoomBy > this.panningTracker.MAX_ZOOM)
      return;

    this.panningTracker.zoom *= zoomBy;

    const center = this.panningTracker.center;
    this.panningTracker.moveCenter(
      x - (x - center.x) * zoomBy,
      y - (y - center.y) * zoomBy,
    );

    // this.center.x = x - (x - this.center.x) * zoomBy;
    // this.center.y = y - (y - this.center.y) * zoomBy;
  }

  private onMouseScroll = (e: WheelEvent) => {
    e.preventDefault();

    if (this.mouseMode === "trackpad") {
      const ratio = this.viewPortTracker.HDPI;

      const { deltaX, deltaY } = e;

      //if (Math.abs(deltaX) < 1 && Math.abs(deltaY) > 0) {
      if (Math.floor(deltaX) === deltaX && Math.floor(deltaY) !== deltaY) {
        // likely pitch to zoom

        const x = e.offsetX * ratio;
        const y = e.offsetY * ratio;

        const ZOOM_COEF = 0.08 * Math.pow(this.panningTracker.zoom, 0.7);
        const zoomBy = deltaY * -ZOOM_COEF;

        if (this.panningTracker.zoom + zoomBy < this.panningTracker.MIN_ZOOM)
          return;
        if (this.panningTracker.zoom + zoomBy > this.panningTracker.MAX_ZOOM)
          return;

        const worldBeforeZoom = this.panningTracker.screenToWorld(new V2(x, y));

        this.panningTracker.zoom += zoomBy;
        this.panningTracker.recalculate();

        const worldAfterZoom = this.panningTracker.screenToWorld(new V2(x, y));

        const worldDiff = worldAfterZoom.sub(worldBeforeZoom);

        // why we need to divide by viewPortRatio? I have no clue
        this.panningTracker.moveCenterBy(
          (worldDiff.x *
            this.panningTracker.zoom *
            this.viewPortTracker.width) /
            this.viewPortTracker.viewPortRatio,
          -(
            worldDiff.y *
            this.panningTracker.zoom *
            this.viewPortTracker.height
          ),
        );

        /*
        this.center.x +=
          (worldDiff.x * this.zoom * this.width) / this.viewPortRatio;
        this.center.y += -worldDiff.y * this.zoom * this.height;
        */

        // this.center.x = x - (x - this.center.x) * (zoomBy / this.zoom * 10);
        // this.center.y = y - (y - this.center.y) * (zoomBy / this.zoom * 10);
      } else {
        const SPEED_COEF = 2;
        this.panningTracker.moveCenterBy(
          -deltaX * this.viewPortTracker.HDPI * SPEED_COEF,
          -deltaY * this.viewPortTracker.HDPI * SPEED_COEF,
        );
        /*
        this.center.x += -deltaX * this.ratio * SPEED_COEF;
        this.center.y += -deltaY * this.ratio * SPEED_COEF;
        */
      }
    } else {
      this.handleZoom(e);
    }
  };
}
