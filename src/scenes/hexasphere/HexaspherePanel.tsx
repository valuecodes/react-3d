import { Brush, Flag, Orbit, Target } from "lucide-react";

import { SimulationControls } from "../../components/shell/SimulationControls";
import { StatusSection } from "../../components/shell/StatusSection";
import { Button } from "../../components/ui/Button";
import { Kbd } from "../../components/ui/Kbd";
import { Section } from "../../components/ui/Section";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import type { SegmentedOption } from "../../components/ui/SegmentedControl";
import { Slider } from "../../components/ui/Slider";
import { MODE_VIEWPORT, useHexasphere } from "./HexasphereProvider";
import { ALGORITHMS, DETAIL_RANGE, WALL_WIDTH_RANGE } from "./options";
import type { Algorithm, Mode } from "./options";

const ALGORITHM_OPTIONS: readonly SegmentedOption<Algorithm>[] = ALGORITHMS.map(
  (value) => ({ value, label: value })
);

const MODE_OPTIONS: readonly SegmentedOption<Mode>[] = [
  { value: "Rotate", label: "Rotate", icon: Orbit },
  { value: "AddWalls", label: "Walls", icon: Brush },
  { value: "Add Start", label: "Start", icon: Flag },
  { value: "Add Target", label: "Target", icon: Target },
];

const MODE_HINTS: Record<Mode, string> = {
  Rotate: "Drag to orbit, scroll to zoom",
  AddWalls: MODE_VIEWPORT.AddWalls.mode?.hint ?? "",
  "Add Start": MODE_VIEWPORT["Add Start"].mode?.hint ?? "",
  "Add Target": MODE_VIEWPORT["Add Target"].mode?.hint ?? "",
};

export function HexaspherePanel() {
  const { options, setOption, sendCommand, setSphere, simulation } =
    useHexasphere();
  const { Algorithm, Mode, sphere } = options;
  const isPathfinder = Algorithm === "Pathfinder";
  const isMazeCreator = Algorithm === "Maze Creator";

  return (
    <>
      <Section title="Algorithm">
        <SegmentedControl
          label="Algorithm"
          options={ALGORITHM_OPTIONS}
          value={Algorithm}
          onChange={(value) => setOption({ key: "Algorithm", value })}
        />
        {Algorithm === null && (
          <p className="text-sm text-muted">
            Pick an algorithm to run on the sphere.
          </p>
        )}
      </Section>

      {Algorithm !== null && !isMazeCreator && (
        <Section title="Mode">
          <SegmentedControl
            label="Mode"
            options={MODE_OPTIONS.filter(
              (option) => option.value !== "AddWalls" || isPathfinder
            )}
            value={Mode}
            onChange={(value) => setOption({ key: "Mode", value })}
          />
          <p className="text-sm text-muted">
            {MODE_HINTS[Mode]}
            {Mode !== "Rotate" && (
              <>
                {" "}
                <Kbd>Esc</Kbd> returns to rotate.
              </>
            )}
          </p>
        </Section>
      )}

      {Algorithm !== null && (
        <Section title="Actions">
          {isPathfinder && (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  sendCommand({ key: "Obstacles", value: "Set random" })
                }
              >
                Random obstacles
              </Button>
              <Button
                onClick={() =>
                  sendCommand({ key: "Obstacles", value: "Clear All" })
                }
              >
                Clear obstacles
              </Button>
            </div>
          )}
          <SimulationControls
            simulation={simulation}
            startLabel={isMazeCreator ? "Carve maze" : "Start"}
            onStart={() => sendCommand({ key: "Simulation", value: "Start" })}
            onReset={() => sendCommand({ key: "Simulation", value: "Reset" })}
          />
        </Section>
      )}

      <Section title="Sphere">
        <Slider
          label="Detail"
          min={DETAIL_RANGE.min}
          max={DETAIL_RANGE.max}
          value={sphere.detail}
          onChange={(value) => setSphere({ key: "detail", value })}
          format={(value) => `${10 * 4 ** value + 2} tiles`}
        />
        <Slider
          label="Wall width"
          min={WALL_WIDTH_RANGE.min}
          max={WALL_WIDTH_RANGE.max}
          value={sphere.wallWidth}
          onChange={(value) => setSphere({ key: "wallWidth", value })}
        />
      </Section>

      <StatusSection />
    </>
  );
}
