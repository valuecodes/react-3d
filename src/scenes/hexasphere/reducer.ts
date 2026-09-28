import { DETAIL_RANGE, WALL_WIDTH_RANGE } from "./options";
import type { Action, Algorithm, Mode, Options } from "./options";

/** The mode a freshly chosen algorithm starts in: pathfinders need a start tile first. */
export function initialModeFor(algorithm: Algorithm | null): Mode {
  return algorithm === "Pathfinder" || algorithm === "Maze Pathfinder"
    ? "Add Start"
    : "Rotate";
}

export function hexasphereReducer(state: Options, action: Action): Options {
  switch (action.type) {
    case "SET":
      switch (action.key) {
        case "Algorithm":
          return {
            ...state,
            Algorithm: action.value,
            Mode: initialModeFor(action.value),
          };
        case "Mode":
          return { ...state, Mode: action.value };
      }
      break;
    case "COMMAND":
      switch (action.key) {
        case "Obstacles":
          return {
            ...state,
            Obstacles: { value: action.value, seq: nextSeq(state.Obstacles) },
          };
        case "Simulation":
          return {
            ...state,
            Simulation: { value: action.value, seq: nextSeq(state.Simulation) },
          };
      }
      break;
    case "SET_SPHERE": {
      const range = action.key === "detail" ? DETAIL_RANGE : WALL_WIDTH_RANGE;
      const value = clamp(Math.round(action.value), range.min, range.max);
      if (value === state.sphere[action.key]) return state;
      return { ...state, sphere: { ...state.sphere, [action.key]: value } };
    }
  }
  return state;
}

function nextSeq(previous: { seq: number } | null): number {
  return (previous?.seq ?? 0) + 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
