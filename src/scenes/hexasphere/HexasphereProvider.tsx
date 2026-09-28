import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { ReactNode } from "react";

import { idleStatus, statusStore } from "../../lib/statusStore";
import { defaultViewport, viewportStore } from "../../lib/viewportStore";
import type { ViewportState } from "../../lib/viewportStore";
import { createPathLine } from "../../three/pathline";
import type { PathLine } from "../../three/pathline";
import { createHexasphere } from "./model/hexasphere";
import type { Hexasphere } from "./model/hexasphere";
import { Simulation } from "./model/simulation";
import { initialOptions } from "./options";
import type {
  CommandChange,
  Mode,
  Options,
  SettingChange,
  SphereChange,
} from "./options";
import { hexasphereReducer } from "./reducer";

export type HexasphereStore = {
  options: Options;
  setOption: (change: SettingChange) => void;
  sendCommand: (change: CommandChange) => void;
  setSphere: (change: SphereChange) => void;
  hexasphere: Hexasphere;
  pathLine: PathLine;
  simulation: Simulation;
};

const HexasphereContext = createContext<HexasphereStore | null>(null);

/** What each mode asks of the viewport. Rotate shows no pill. */
export const MODE_VIEWPORT: Record<Mode, ViewportState> = {
  Rotate: defaultViewport,
  AddWalls: {
    orbitEnabled: false,
    cursor: "cell",
    mode: {
      label: "Painting walls",
      hint: "Drag across tiles to paint obstacles",
    },
  },
  "Add Start": {
    orbitEnabled: false,
    cursor: "crosshair",
    mode: { label: "Placing start", hint: "Click a tile to place the start" },
  },
  "Add Target": {
    orbitEnabled: false,
    cursor: "crosshair",
    mode: { label: "Placing target", hint: "Click a tile to place the target" },
  },
};

/** Owns the hexasphere options, the three.js model and the simulation for both the panel and the scene. */
export function HexasphereProvider({ children }: { children: ReactNode }) {
  const [options, dispatch] = useReducer(hexasphereReducer, initialOptions);
  const { sphere } = options;

  const hexasphere = useMemo(() => createHexasphere(sphere), [sphere]);
  useEffect(() => () => hexasphere.dispose(), [hexasphere]);

  const pathLine = useMemo(
    () => createPathLine(hexasphere.tiles.length, sphere.pathLine),
    [hexasphere, sphere.pathLine]
  );
  useEffect(() => () => pathLine.dispose(), [pathLine]);

  const simulation = useMemo(
    () =>
      new Simulation(hexasphere, pathLine, sphere.detail, (status) =>
        statusStore.set(status)
      ),
    [hexasphere, pathLine, sphere.detail]
  );

  // Commands carry a sequence number; remember the last one handled so a
  // re-render (or a remount of this scene) never replays it.
  const handled = useRef({
    Obstacles: options.Obstacles?.seq ?? 0,
    Simulation: options.Simulation?.seq ?? 0,
  });

  useEffect(() => {
    simulation.setAlgorithm(options.Algorithm);
  }, [simulation, options.Algorithm]);

  useEffect(() => {
    const command = options.Obstacles;
    if (!command || command.seq === handled.current.Obstacles) return;
    handled.current.Obstacles = command.seq;
    simulation.setObstacles(command.value);
  }, [simulation, options.Obstacles]);

  useEffect(() => {
    const command = options.Simulation;
    if (!command || command.seq === handled.current.Simulation) return;
    handled.current.Simulation = command.seq;
    if (command.value === "Start") simulation.start();
    else simulation.reset();
  }, [simulation, options.Simulation]);

  // The status store belongs to whichever scene is mounted.
  useEffect(() => {
    statusStore.set(simulation.status());
    return () => statusStore.set(idleStatus());
  }, [simulation]);

  useEffect(() => {
    viewportStore.set(MODE_VIEWPORT[options.Mode]);
    return () => viewportStore.set(defaultViewport);
  }, [options.Mode]);

  const setOption = useCallback((change: SettingChange) => {
    dispatch({ type: "SET", ...change });
  }, []);

  const sendCommand = useCallback((change: CommandChange) => {
    dispatch({ type: "COMMAND", ...change });
  }, []);

  const setSphere = useCallback((change: SphereChange) => {
    dispatch({ type: "SET_SPHERE", ...change });
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
      setOption({ key: "Mode", value: "Rotate" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOption]);

  const store = useMemo<HexasphereStore>(
    () => ({
      options,
      setOption,
      sendCommand,
      setSphere,
      hexasphere,
      pathLine,
      simulation,
    }),
    [
      options,
      setOption,
      sendCommand,
      setSphere,
      hexasphere,
      pathLine,
      simulation,
    ]
  );

  return (
    <HexasphereContext.Provider value={store}>
      {children}
    </HexasphereContext.Provider>
  );
}

export function useHexasphere(): HexasphereStore {
  const store = useContext(HexasphereContext);
  if (!store)
    throw new Error("useHexasphere must be used inside HexasphereProvider");
  return store;
}
