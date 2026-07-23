import type { DefineComponent, Plugin, App } from 'vue';

/** Plain move-state object dispatched by lit-movable (CustomEvent.detail). */
export interface Coord {
  x: number;
  y: number;
}

export interface MoveState {
  coords: Coord;
  startCoord: Coord;
  moveDist: Coord;
  totalDist: Coord;
  mouseCoord: Coord;
  clickOffset: Coord;
  posTop: number;
  posLeft: number;
  pctX?: number;
  pctY?: number;
  isMoving: boolean;
}

export interface VMovableProps {
  /** Initial / v-model left (px). Set before boundsX when both change. */
  left?: number;
  /** Initial / v-model top (px). Set before boundsY when both change. */
  top?: number;
  /** Snap increment in px (default 1). */
  grid?: number;
  /** Relative "min,max" offsets from current left. "null" locks X. */
  boundsX?: string;
  /** Relative "min,max" offsets from current top. "null" locks Y. */
  boundsY?: string;
  /** "x" | "y" locks the orthogonal axis to the current position. */
  axis?: 'x' | 'y';
  /** Disable dragging. */
  disabled?: boolean;
  /** With open bounds, Shift constrains to the dominant axis. */
  shiftBehavior?: boolean;
  /** Fire events but do not reposition the target. */
  eventsOnly?: boolean;
  /** CSS selector for the element that moves (default: the element itself). */
  targetSelector?: string;
  /** Pointer travel (px) before a drag starts (default 0). */
  dragAfterDist?: number;
}

export declare const VMovable: DefineComponent<
  VMovableProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    'update:left': (value: number) => void;
    'update:top': (value: number) => void;
    movestart: (state: MoveState) => void;
    move: (state: MoveState) => void;
    moveend: (state: MoveState) => void;
  }
>;

declare const plugin: Plugin & {
  install: (app: App) => void;
};

export default plugin;

declare module 'vue' {
  interface GlobalComponents {
    VMovable: typeof VMovable;
  }
}
