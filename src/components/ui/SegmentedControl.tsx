import type { LucideIcon } from "lucide-react";

import { cx } from "../../lib/cx";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type Props<T extends string> = {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

/** A radio group drawn as connected buttons. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-lg bg-raised p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "inline-flex min-w-fit flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
              selected
                ? "bg-card text-accent shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
