import type { Action, Options } from "./options";

export function appReducer(state: Options, action: Action): Options {
  switch (action.type) {
    case "SET":
      switch (action.key) {
        case "Algorithm":
          // Changing algorithm always returns to rotate mode.
          return { ...state, Algorithm: action.value, Mode: "Rotate" };
        case "Mode":
          return { ...state, Mode: action.value };
        case "Position":
          return { ...state, Position: action.value };
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
  }
  return state;
}

function nextSeq(previous: { seq: number } | null): number {
  return (previous?.seq ?? 0) + 1;
}
