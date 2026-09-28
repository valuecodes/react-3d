import type { ReactNode } from "react";

type Props = { title: string; children: ReactNode };

export function Section({ title, children }: Props) {
  return (
    <section className="flex flex-col gap-2 border-t border-line px-4 py-3 first:border-t-0">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
