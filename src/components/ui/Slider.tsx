import { useId } from "react";

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Value readout; defaults to the number itself. */
  format?: (value: number) => string;
};

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
}: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id}>{label}</label>
        <span className="text-muted tabular-nums">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
