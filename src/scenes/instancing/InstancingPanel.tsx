import { Pause, Play } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { Slider } from "../../components/ui/Slider";
import { useInstancing } from "./InstancingProvider";
import { AMPLITUDE_RANGE, SIDE_RANGE, SPACING_RANGE } from "./layout";

export function InstancingPanel() {
  const { options, update } = useInstancing();
  const { side, spacing, animate, amplitude } = options;

  return (
    <>
      <Section title="Grid">
        <Slider
          label="Side"
          min={SIDE_RANGE.min}
          max={SIDE_RANGE.max}
          value={side}
          onChange={(value) => update({ side: value })}
          format={(value) => `${value} x ${value} = ${value * value}`}
        />
        <Slider
          label="Spacing"
          min={SPACING_RANGE.min}
          max={SPACING_RANGE.max}
          step={SPACING_RANGE.step}
          value={spacing}
          onChange={(value) => update({ spacing: value })}
        />
      </Section>

      <Section title="Wave">
        <div className="flex gap-2">
          <Button
            pressed={animate}
            onClick={() => update({ animate: !animate })}
          >
            {animate ? <Pause size={16} /> : <Play size={16} />}
            Animate
          </Button>
        </div>
        <Slider
          label="Amplitude"
          min={AMPLITUDE_RANGE.min}
          max={AMPLITUDE_RANGE.max}
          value={amplitude}
          onChange={(value) => update({ amplitude: value })}
        />
      </Section>

      <Section title="About">
        <p className="text-sm text-muted">
          Every cylinder here is the same mesh. Instancing uploads one geometry
          and one material to the GPU, plus a small per-instance transform and
          colour, so the whole grid is drawn in a single draw call instead of
          one call per object. Moving the wave only rewrites the transform
          buffer each frame.
        </p>
      </Section>
    </>
  );
}
