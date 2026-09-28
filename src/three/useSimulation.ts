import { useFrame } from "@react-three/fiber";

import { speedStore, statusStore } from "../lib/statusStore";

/** What the shared Start / Pause / Reset controls drive. */
export type Simulation = {
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  /** One algorithm step. Called `speedStore` times per frame while running. */
  tick(): void;
};

/** Steps the simulation from the render loop while its reported phase is "running". */
export function useSimulation(simulation: { tick(): void }): void {
  useFrame(() => {
    const steps = speedStore.get();
    for (let i = 0; i < steps; i++) {
      if (statusStore.get().phase !== "running") return;
      simulation.tick();
    }
  });
}
