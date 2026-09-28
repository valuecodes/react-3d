import { Pause, Play, RotateCcw } from "lucide-react";

import {
  SPEED_MAX,
  SPEED_MIN,
  speedStore,
  statusStore,
} from "../../lib/statusStore";
import { useStore } from "../../lib/store";
import type { Simulation } from "../../three/useSimulation";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";

type Props = {
  simulation: Simulation;
  startLabel?: string;
  /** Overrides for scenes that route Start / Reset through their own state. */
  onStart?: () => void;
  onReset?: () => void;
};

/** Start, Pause / Resume, Reset and the shared speed slider for any simulation. */
export function SimulationControls({
  simulation,
  startLabel = "Start",
  onStart,
  onReset,
}: Props) {
  const status = useStore(statusStore);
  const speed = useStore(speedStore);
  const inProgress = status.phase === "running" || status.phase === "paused";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={!status.canStart}
          title={status.canStart ? undefined : status.message}
          onClick={onStart ?? (() => simulation.start())}
        >
          <Play className="size-4" aria-hidden />
          {startLabel}
        </Button>
        {inProgress &&
          (status.phase === "paused" ? (
            <Button onClick={() => simulation.resume()}>
              <Play className="size-4" aria-hidden />
              Resume
            </Button>
          ) : (
            <Button onClick={() => simulation.pause()}>
              <Pause className="size-4" aria-hidden />
              Pause
            </Button>
          ))}
        <Button onClick={onReset ?? (() => simulation.reset())}>
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>
      </div>
      <Slider
        label="Speed"
        min={SPEED_MIN}
        max={SPEED_MAX}
        value={speed}
        onChange={(value) => speedStore.set(value)}
        format={(value) => `${value}× per frame`}
      />
    </div>
  );
}
