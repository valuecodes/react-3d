import { RotateCcw, RotateCw } from "lucide-react";

import type { CameraPreset } from "../../scenes/types";
import type { HelperToggles } from "../../three/Helpers";
import { Button } from "../ui/Button";
import { Section } from "../ui/Section";

type Props = {
  presets: readonly CameraPreset[];
  helpers: HelperToggles;
  orbit: boolean;
  onPreset: (preset: CameraPreset) => void;
  onOrbit: (yaw: number) => void;
  onToggleHelper: (key: keyof HelperToggles) => void;
  onToggleOrbit: () => void;
};

export function CameraPanel({
  presets,
  helpers,
  orbit,
  onPreset,
  onOrbit,
  onToggleHelper,
  onToggleOrbit,
}: Props) {
  return (
    <Section title="Camera">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <Button key={preset.id} onClick={() => onPreset(preset)}>
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          onClick={() => onOrbit(Math.PI / 2)}
          aria-label="Rotate view left"
        >
          <RotateCcw className="size-4" aria-hidden />
          Left
        </Button>
        <Button
          onClick={() => onOrbit(-Math.PI / 2)}
          aria-label="Rotate view right"
        >
          <RotateCw className="size-4" aria-hidden />
          Right
        </Button>
        <Button pressed={orbit} onClick={onToggleOrbit}>
          Orbit
        </Button>
        <Button pressed={helpers.grid} onClick={() => onToggleHelper("grid")}>
          Grid
        </Button>
        <Button pressed={helpers.axes} onClick={() => onToggleHelper("axes")}>
          Axes
        </Button>
      </div>
    </Section>
  );
}
