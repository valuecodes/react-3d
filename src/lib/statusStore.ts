import { createStore } from "./store";

export type Phase = "idle" | "running" | "paused" | "done" | "failed";

export type StatusDetail = { label: string; value: string };

/** What a simulation reports to the sidebar. Written from the render loop, read by React. */
export type SimulationStatus = {
  phase: Phase;
  /** 0..1, or null when the run has no meaningful progress measure. */
  progress: number | null;
  /** One line for the user: what is happening, or why Start is disabled. */
  message: string;
  canStart: boolean;
  details: readonly StatusDetail[];
};

export type StatusReporter = (status: SimulationStatus) => void;

export function idleStatus(message = ""): SimulationStatus {
  return {
    phase: "idle",
    progress: null,
    message,
    canStart: false,
    details: [],
  };
}

export function equalStatus(a: SimulationStatus, b: SimulationStatus): boolean {
  if (
    a.phase !== b.phase ||
    a.progress !== b.progress ||
    a.message !== b.message ||
    a.canStart !== b.canStart ||
    a.details.length !== b.details.length
  ) {
    return false;
  }
  for (let i = 0; i < a.details.length; i++) {
    const x = a.details[i];
    const y = b.details[i];
    if (x?.label !== y?.label || x?.value !== y?.value) return false;
  }
  return true;
}

/** The active scene's simulation status. Each scene provider reports on mount and resets to idle on unmount. */
export const statusStore = createStore(idleStatus(), equalStatus);

export const SPEED_MIN = 1;
export const SPEED_MAX = 10;

/** Simulation steps per animation frame, shared by every scene. */
export const speedStore = createStore(SPEED_MIN);
