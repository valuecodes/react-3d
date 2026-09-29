import { Flag, Orbit, Target } from "lucide-react";

import { SimulationControls } from "../../components/shell/SimulationControls";
import { StatusSection } from "../../components/shell/StatusSection";
import { Button } from "../../components/ui/Button";
import { Kbd } from "../../components/ui/Kbd";
import { Section } from "../../components/ui/Section";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import type { SegmentedOption } from "../../components/ui/SegmentedControl";
import { Slider } from "../../components/ui/Slider";
import {
  CELL_SIZE_RANGE,
  MODE_VIEWPORT,
  SIZE_RANGE,
  useCube,
} from "./CubeProvider";
import type { CubeMode } from "./CubeProvider";

const MODE_OPTIONS: readonly SegmentedOption<CubeMode>[] = [
  { value: "orbit", label: "Orbit", icon: Orbit },
  { value: "start", label: "Start", icon: Flag },
  { value: "target", label: "Target", icon: Target },
];

const MODE_HINTS: Record<CubeMode, string> = {
  orbit: "Drag to orbit, scroll to zoom",
  start: MODE_VIEWPORT.start.mode?.hint ?? "",
  target: MODE_VIEWPORT.target.mode?.hint ?? "",
};

type SidesValue = "3" | "6";

const SIDES_OPTIONS: readonly SegmentedOption<SidesValue>[] = [
  { value: "3", label: "3 faces" },
  { value: "6", label: "6 faces" },
];

export function CubePanel() {
  const {
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
    simulation,
  } = useCube();
  const isAstar = variant === "astar";
  const hasWalls = !isAstar;

  return (
    <>
      <Section title="Cube">
        <Slider
          label="Size"
          min={SIZE_RANGE.min}
          max={SIZE_RANGE.max}
          value={options.size}
          onChange={(size) => setOptions({ size })}
          format={(size) => `${size} × ${size} cells`}
        />
        <Slider
          label="Cell size"
          min={CELL_SIZE_RANGE.min}
          max={CELL_SIZE_RANGE.max}
          step={0.5}
          value={options.cellSize}
          onChange={(cellSize) => setOptions({ cellSize })}
        />
        <SegmentedControl
          label="Faces"
          options={SIDES_OPTIONS}
          value={String(options.sides) as SidesValue}
          onChange={(value) => setOptions({ sides: value === "6" ? 6 : 3 })}
        />
        {isAstar && (
          <div className="flex flex-wrap gap-2">
            <Button
              pressed={options.obstacles}
              onClick={() => setOptions({ obstacles: !options.obstacles })}
            >
              Obstacles
            </Button>
            <Button
              pressed={options.fullNeighbors}
              onClick={() =>
                setOptions({ fullNeighbors: !options.fullNeighbors })
              }
            >
              Diagonals
            </Button>
          </div>
        )}
      </Section>

      <Section title="View">
        <div className="flex flex-wrap gap-2">
          <Button pressed={showFrame} onClick={() => setShowFrame(!showFrame)}>
            Show frame
          </Button>
          <Button
            pressed={formation === "net"}
            onClick={() => setFormation(formation === "net" ? "cube" : "net")}
          >
            Open cube
          </Button>
          {hasWalls && (
            <Button
              pressed={hideWalls}
              onClick={() => setHideWalls(!hideWalls)}
            >
              Hide walls
            </Button>
          )}
          <Button
            pressed={autoRotate}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            Auto-rotate
          </Button>
        </div>
      </Section>

      <Section title="Mode">
        <SegmentedControl
          label="Mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
        />
        <p className="text-sm text-muted">
          {MODE_HINTS[mode]}
          {mode !== "orbit" && (
            <>
              {" "}
              <Kbd>Esc</Kbd> returns to orbit.
            </>
          )}
        </p>
      </Section>

      <Section title="Actions">
        <SimulationControls
          simulation={simulation}
          startLabel={variant === "maze" ? "Carve maze" : "Start"}
        />
      </Section>

      <StatusSection />
    </>
  );
}
