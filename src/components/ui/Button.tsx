import type { ButtonHTMLAttributes } from "react";

import { cx } from "../../lib/cx";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:brightness-110 disabled:hover:brightness-100",
  secondary: "bg-raised text-ink hover:bg-line",
  ghost: "bg-transparent text-ink hover:bg-raised",
};

/** Toggle buttons that are on. Chosen instead of a variant so the two never stack. */
const PRESSED = "bg-accent text-white hover:brightness-110";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Toggle buttons: renders `aria-pressed` and the pressed style. */
  pressed?: boolean;
};

export function Button({
  variant = "secondary",
  pressed,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        pressed ? PRESSED : VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
