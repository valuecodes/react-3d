import { Brush, Flag, Orbit, Target } from "lucide-react";

import { SimulationControls } from "../../components/shell/SimulationControls";
import { StatusSection } from "../../components/shell/StatusSection";
import { Button } from "../../components/ui/Button";
import { Kbd } from "../../components/ui/Kbd";
import { Section } from "../../components/ui/Section";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import type { SegmentedOption } from "../../components/ui/SegmentedControl";
import { Slider } from "../../components/ui/Slider";
import { COLS_RANGE, ROWS_RANGE, WALL_CHANCE_RANGE } from "./grid";
import type { GridVariant } from "./grid";
import { MODE_VIEWPORT, useGrid } from "./GridProvider";
import type { GridMode } from "./GridProvider";

const MODE_OPTIONS: readonly SegmentedOption<GridMode>[] = [
  { value: "orbit", label: "Orbit", icon: Orbit },
  { value: "start", label: "Start", icon: Flag },
  { value: "target", label: "Target", icon: Target },
  { value: "obstacle", label: "Obstacles", icon: Brush },
];

const MODE_HINTS: Record<GridMode, string> = {
  orbit: "Drag to orbit, scroll to zoom",
  start: MODE_VIEWPORT.start.mode?.hint ?? "",
  target: MODE_VIEWPORT.target.mode?.hint ?? "",
  obstacle: MODE_VIEWPORT.obstacle.mode?.hint ?? "",
};

const START_LABELS: Record<GridVariant, string> = {
  astar: "Find path",
  maze: "Carve maze",
  mazePathfinder: "Carve and solve",
};

export function GridPanel() {
  const { variant, options, setOptions, mode, setMode, simulation } = useGrid();
  const isAstar = variant === "astar";

  return (
    <>
      <Section title="Board">
        <Slider
          label="Rows"
          min={ROWS_RANGE.min}
          max={ROWS_RANGE.max}
          value={options.rows}
          onChange={(rows) => setOptions({ rows })}
        />
        <Slider
          label="Columns"
          min={COLS_RANGE.min}
          max={COLS_RANGE.max}
          value={options.cols}
          onChange={(cols) => setOptions({ cols })}
        />
        {isAstar && (
          <>
            <Slider
              label="Obstacle chance"
              min={WALL_CHANCE_RANGE.min}
              max={WALL_CHANCE_RANGE.max}
              step={WALL_CHANCE_RANGE.step}
              value={options.wallChance}
              onChange={(wallChance) => setOptions({ wallChance })}
              format={(value) => `${Math.round(value * 100)}%`}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  simulation.setObstacles("random", options.wallChance)
                }
              >
                Random obstacles
              </Button>
              <Button onClick={() => simulation.setObstacles("clear")}>
                Clear obstacles
              </Button>
              <Button
                pressed={options.diagonal}
                onClick={() => setOptions({ diagonal: !options.diagonal })}
              >
                Diagonal moves
              </Button>
            </div>
          </>
        )}
      </Section>

      {variant !== "maze" && (
        <Section title="Mode">
          <SegmentedControl
            label="Mode"
            options={MODE_OPTIONS.filter(
              (option) => option.value !== "obstacle" || isAstar
            )}
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
      )}

      <Section title="Actions">
        <SimulationControls
          simulation={simulation}
          startLabel={START_LABELS[variant]}
        />
      </Section>

      <StatusSection />
    </>
  );
}
