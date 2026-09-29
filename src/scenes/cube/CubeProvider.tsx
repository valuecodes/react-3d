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
import { createCube } from "./cube";
import type { Cube } from "./cube";
import { CubeMeshes, PATH_LINE_COLOR } from "./cubeMeshes";
import { CubeSimulation } from "./cubeSimulation";
import type { CubeVariant } from "./cubeSimulation";
import type { CubeOptions, Formation } from "./formations";

export type CubeMode = "orbit" | "start" | "target";

export const SIZE_RANGE = { min: 4, max: 30 } as const;
export const CELL_SIZE_RANGE = { min: 1, max: 5 } as const;

export const DEFAULT_OPTIONS: Record<CubeVariant, CubeOptions> = {
  maze: {
    size: 12,
    cellSize: 3,
    sides: 3,
    obstacles: false,
    fullNeighbors: false,
  },
  astar: {
    size: 24,
    cellSize: 2.5,
    sides: 3,
    obstacles: true,
    fullNeighbors: true,
  },
  mazePathfinder: {
    size: 16,
    cellSize: 3,
    sides: 3,
    obstacles: false,
    fullNeighbors: false,
  },
};

/** What each mode asks of the viewport. Orbit shows no pill. */
export const MODE_VIEWPORT: Record<CubeMode, ViewportState> = {
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
};

export type CubeStore = {
  variant: CubeVariant;
  options: CubeOptions;
  setOptions: (patch: Partial<CubeOptions>) => void;
  formation: Formation;
  setFormation: (formation: Formation) => void;
  showFrame: boolean;
  setShowFrame: (show: boolean) => void;
  hideWalls: boolean;
  setHideWalls: (hide: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (rotate: boolean) => void;
  mode: CubeMode;
  setMode: (mode: CubeMode) => void;
  cube: Cube;
  meshes: CubeMeshes;
  pathLine: PathLine;
  simulation: CubeSimulation;
};

const CubeContext = createContext<CubeStore | null>(null);

type Props = { variant: CubeVariant; children: ReactNode };

/** Owns the cube options, the three.js model and the simulation for both the panel and the scene. */
export function CubeProvider({ variant, children }: Props) {
  const [options, setOptionsState] = useState<CubeOptions>(
    DEFAULT_OPTIONS[variant]
  );
  const [formation, setFormation] = useState<Formation>("cube");
  const [showFrame, setShowFrame] = useState(false);
  const [hideWalls, setHideWalls] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [mode, setMode] = useState<CubeMode>("orbit");

  const setOptions = useCallback((patch: Partial<CubeOptions>) => {
    setOptionsState((previous) => ({ ...previous, ...patch }));
  }, []);

  const cube = useMemo(() => createCube(options), [options]);

  const meshes = useMemo(
    () => new CubeMeshes(cube, variant !== "astar"),
    [cube, variant]
  );
  useEffect(() => () => meshes.dispose(), [meshes]);

  // Capacity for every cell plus an edge point between each pair on different faces.
  const pathLine = useMemo(
    () => createPathLine(2 * cube.cells.length, PATH_LINE_COLOR),
    [cube]
  );
  useEffect(() => () => pathLine.dispose(), [pathLine]);

  const simulation = useMemo(
    () =>
      new CubeSimulation(
        cube,
        meshes,
        pathLine,
        variant,
        Math.random,
        (status) => statusStore.set(status)
      ),
    [cube, meshes, pathLine, variant]
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

  const store = useMemo<CubeStore>(
    () => ({
      variant,
      options,
      setOptions,
      formation,
      setFormation,
      showFrame,
      setShowFrame,
      hideWalls,
      setHideWalls,
      autoRotate,
      setAutoRotate,
      mode,
      setMode,
      cube,
      meshes,
      pathLine,
      simulation,
    }),
    [
      variant,
      options,
      setOptions,
      formation,
      showFrame,
      hideWalls,
      autoRotate,
      mode,
      cube,
      meshes,
      pathLine,
      simulation,
    ]
  );

  return <CubeContext.Provider value={store}>{children}</CubeContext.Provider>;
}

export function useCube(): CubeStore {
  const store = useContext(CubeContext);
  if (!store) throw new Error("useCube must be used inside CubeProvider");
  return store;
}
