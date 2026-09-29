import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent } from "react";

import { cx } from "../../lib/cx";
import { at } from "../../lib/invariant";

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

const STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * A radio group drawn as connected buttons. Follows the radio keyboard
 * contract: one tab stop, arrow keys move (and select) within the group.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = STEP[event.key];
    if (step === undefined || options.length === 0) return;
    event.preventDefault();
    const from = selectedIndex === -1 ? 0 : selectedIndex;
    const next = at(options, (from + step + options.length) % options.length);
    onChange(next.value);
    const group = event.currentTarget.parentElement;
    const button = group?.querySelector<HTMLButtonElement>(
      `[data-value="${next.value}"]`
    );
    button?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-lg bg-raised p-1"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        // The selected option is the tab stop; with nothing selected, the first.
        const tabStop = selected || (selectedIndex === -1 && index === 0);
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabStop ? 0 : -1}
            data-value={option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
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
