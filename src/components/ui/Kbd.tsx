import type { ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-card px-1 font-mono text-xs text-ink">
      {children}
    </kbd>
  );
}
