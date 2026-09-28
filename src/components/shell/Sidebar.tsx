import type { ReactNode } from "react";

import { cx } from "../../lib/cx";

type Props = { open: boolean; onClose: () => void; children: ReactNode };

/** Fixed on the left on wide screens; a slide-in drawer under 768px. */
export function Sidebar({ open, onClose, children }: Props) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-10 bg-ink/30 md:hidden"
        />
      )}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-20 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-line bg-card transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </aside>
    </>
  );
}
