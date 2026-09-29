import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { idleStatus, statusStore } from "../../lib/statusStore";
import { defaultViewport, viewportStore } from "../../lib/viewportStore";
import type { ViewportState } from "../../lib/viewportStore";
import { createPathLine } from "../../three/pathline";
import type { PathLine } from "../../three/pathline";
import { createGrid, defaultGridOptions } from "./grid";
import type { Grid, GridOptions, GridVariant } from "./grid";
import { createGridMeshes, GRID_SCHEMES } from "./gridMeshes";
import type { GridMeshes } from "./gridMeshes";
import { GridSimulation } from "./gridSimulation";

/** What a click on the board does. `orbit` is the neutral mode. */
export type GridMode = "orbit" | "start" | "target" | "obstacle";

export type GridStore = {
  variant: GridVariant;
  options: GridOptions;
  setOptions: (patch: Partial<GridOptions>) => void;
  mode: GridMode;
  setMode: (mode: GridMode) => void;
  grid: Grid;
  meshes: GridMeshes;
  pathLine: PathLine;
  simulation: GridSimulation;
};

const GridContext = createContext<GridStore | null>(null);

/** What each mode asks of the viewport. Orbit shows no pill. */
export const MODE_VIEWPORT: Record<GridMode, ViewportState> = {
  orbit: defaultViewport,
  start: {
    orbitEnabled: false,
    cursor: "crosshair",
    mode: { label: "Placing start", hint: "Click a cell to place the start" },
  },
  target: {
    orbitEnabled: false,
    cursor: "crosshair",
    mode: { label: "Placing target", hint: "Click a cell to place the target" },
  },
  obstacle: {
    orbitEnabled: false,
    cursor: "cell",
    mode: {
      label: "Painting obstacles",
      hint: "Drag across cells to paint obstacles",
    },
  },
};

type Props = { variant: GridVariant; children: ReactNode };

/** Owns the board options, the three.js meshes and the simulation for both the panel and the scene. */
export function GridProvider({ variant, children }: Props) {
  const [options, setOptionsState] = useState<GridOptions>(() =>
    defaultGridOptions(variant)
  );
  const [mode, setMode] = useState<GridMode>("orbit");
  const { rows, cols, cellSize } = options;
  // The other variants never use these, so their sliders never rebuild the board.
  const diagonal = variant === "astar" && options.diagonal;
  const wallChance = variant === "astar" ? options.wallChance : 0;
  const scheme = GRID_SCHEMES[variant];

  const grid = useMemo(
    () => createGrid({ rows, cols, cellSize, wallChance, diagonal }),
    [rows, cols, cellSize, wallChance, diagonal]
  );

  const meshes = useMemo(
    () => createGridMeshes(grid, scheme, { walls: variant !== "astar" }),
    [grid, scheme, variant]
  );
  useEffect(() => () => meshes.dispose(), [meshes]);

  const pathLine = useMemo(
    () => createPathLine(grid.cells.length, scheme.pathLine),
    [grid, scheme]
  );
  useEffect(() => () => pathLine.dispose(), [pathLine]);

  const simulation = useMemo(
    () =>
      new GridSimulation(variant, grid, meshes, pathLine, (status) =>
        statusStore.set(status)
      ),
    [variant, grid, meshes, pathLine]
  );

  // The status store belongs to whichever scene is mounted.
  useEffect(() => {
    statusStore.set(simulation.status());
    return () => statusStore.set(idleStatus());
  }, [simulation]);

  useEffect(() => {
    viewportStore.set(MODE_VIEWPORT[mode]);
    return () => viewportStore.set(defaultViewport);
  }, [mode]);

  const setOptions = useCallback((patch: Partial<GridOptions>) => {
    setOptionsState((previous) => ({ ...previous, ...patch }));
  }, []);

  // Escape always returns to orbiting, unless the user is typing somewhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      setMode("orbit");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const store = useMemo<GridStore>(
    () => ({
      variant,
      options,
      setOptions,
      mode,
      setMode,
      grid,
      meshes,
      pathLine,
      simulation,
    }),
    [variant, options, setOptions, mode, grid, meshes, pathLine, simulation]
  );

  return <GridContext.Provider value={store}>{children}</GridContext.Provider>;
}

/** A provider bound to one variant, for the scene registry. */
export function createGridProvider(
  variant: GridVariant
): (props: { children: ReactNode }) => ReactNode {
  function BoundGridProvider({ children }: { children: ReactNode }) {
    return <GridProvider variant={variant}>{children}</GridProvider>;
  }
  return BoundGridProvider;
}

export function useGrid(): GridStore {
  const store = useContext(GridContext);
  if (!store) throw new Error("useGrid must be used inside GridProvider");
  return store;
}
