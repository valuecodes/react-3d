/** Palette entries, in the order the geometry painter indexes them. */
export const COLOR_KEYS = [
  "color",
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "seam",
  "pentagon",
  "notVisible",
  "selected",
  "current",
  "openSet",
  "closedSet",
  "path",
  "obstacle",
  "start",
  "target",
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];
export type ColorScheme = Record<ColorKey, string>;

export const COLOR_INDEX = {
  color: 0,
  q1: 1,
  q2: 2,
  q3: 3,
  q4: 4,
  q5: 5,
  q6: 6,
  q7: 7,
  q8: 8,
  seam: 9,
  pentagon: 10,
  notVisible: 11,
  selected: 12,
  current: 13,
  openSet: 14,
  closedSet: 15,
  path: 16,
  obstacle: 17,
  start: 18,
  target: 19,
} as const satisfies Record<ColorKey, number>;

export type ColorIndex = (typeof COLOR_INDEX)[ColorKey];

/** Wall palette: unvisited, visited, invisible. */
export const WALL = { unvisited: 0, visited: 1, invisible: 2 } as const;
export type WallState = (typeof WALL)[keyof typeof WALL];

export type WallColors = {
  unvisited: string;
  visited: string;
  /** Empty string means fully transparent. */
  notVisible: string;
};

export type SphereOptions = {
  size: number;
  /** Subdivision level in three r117 terms: 10 * 4^detail + 2 tiles. */
  detail: number;
  /** Wall thickness as a power of two: the inner edge sits 2^-wallWidth of the way to the centre. */
  wallWidth: number;
  obstacles: boolean;
  pathLine: string;
  wallColors: WallColors;
  colorScheme: ColorScheme;
};

/** Precomputed mazes exist for detail 0..5; below 2 the sphere is too coarse to be interesting. */
export const DETAIL_RANGE = { min: 2, max: 5 } as const;
export const WALL_WIDTH_RANGE = { min: 1, max: 6 } as const;

export const ALGORITHMS = [
  "Maze Creator",
  "Pathfinder",
  "Maze Pathfinder",
] as const;
export type Algorithm = (typeof ALGORITHMS)[number];
export const MODES = ["Rotate", "AddWalls", "Add Start", "Add Target"] as const;
export type Mode = (typeof MODES)[number];
export type ObstacleCommand = "Set random" | "Clear All";
export type SimulationCommand = "Start" | "Reset";

/** A momentary command. `seq` increases on every press so the same button can fire twice. */
export type Command<T extends string> = { value: T; seq: number };

export type Settings = {
  Algorithm: Algorithm | null;
  Mode: Mode;
};

export type Commands = {
  Obstacles: Command<ObstacleCommand> | null;
  Simulation: Command<SimulationCommand> | null;
};

export type Options = Settings & Commands & { sphere: SphereOptions };

export type SettingKey = keyof Settings;
export type CommandKey = keyof Commands;
export type SphereSetting = "detail" | "wallWidth";

export type SettingChange = {
  [K in SettingKey]: { key: K; value: Settings[K] };
}[SettingKey];

export type CommandChange = {
  [K in CommandKey]: { key: K; value: NonNullable<Commands[K]>["value"] };
}[CommandKey];

export type SphereChange = { key: SphereSetting; value: number };

export type Action =
  | ({ type: "SET" } & SettingChange)
  | ({ type: "COMMAND" } & CommandChange)
  | ({ type: "SET_SPHERE" } & SphereChange);

export const initialOptions: Options = {
  Algorithm: null,
  Mode: "Rotate",
  Obstacles: null,
  Simulation: null,
  sphere: {
    size: 50,
    detail: 4,
    wallWidth: 4,
    obstacles: false,
    pathLine: "black",
    wallColors: {
      unvisited: "red",
      visited: "black",
      notVisible: "",
    },
    colorScheme: {
      color: "gray",
      q1: "#262729",
      q2: "#262729",
      q3: "#262729",
      q4: "#262729",
      q5: "#262729",
      q6: "#262729",
      q7: "#262729",
      q8: "#262729",
      seam: "#262729",
      pentagon: "#262729",
      notVisible: "",
      selected: "yellow",
      current: "purple",
      openSet: "seagreen",
      closedSet: "salmon",
      path: "white",
      obstacle: "black",
      start: "yellow",
      target: "red",
    },
  },
};
