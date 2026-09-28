import type { ReactNode } from "react";

import { cx } from "../../lib/cx";
import type { Phase } from "../../lib/statusStore";

const TONES: Record<Phase, string> = {
  idle: "border-line bg-raised text-muted",
  running: "border-accent/40 bg-accent/10 text-accent",
  paused: "border-warn/40 bg-warn/10 text-warn",
  done: "border-good/40 bg-good/10 text-good",
  failed: "border-bad/40 bg-bad/10 text-bad",
};

export function Badge({
  tone,
  children,
}: {
  tone: Phase;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone]
      )}
    >
      {children}
    </span>
  );
}
