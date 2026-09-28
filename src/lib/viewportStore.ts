import { createStore } from "./store";

export type ViewportCursor = "grab" | "crosshair" | "cell";

/** What the active scene asks of the viewport: orbit on or off, the cursor, and the floating mode pill. */
export type ViewportState = {
  orbitEnabled: boolean;
  cursor: ViewportCursor;
  mode: { label: string; hint: string } | null;
};

export const defaultViewport: ViewportState = {
  orbitEnabled: true,
  cursor: "grab",
  mode: null,
};

function equalViewport(a: ViewportState, b: ViewportState): boolean {
  return (
    a.orbitEnabled === b.orbitEnabled &&
    a.cursor === b.cursor &&
    a.mode?.label === b.mode?.label &&
    a.mode?.hint === b.mode?.hint
  );
}

export const viewportStore = createStore(defaultViewport, equalViewport);
