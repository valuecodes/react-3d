import { statusStore } from "../../lib/statusStore";
import type { Phase } from "../../lib/statusStore";
import { useStore } from "../../lib/store";
import { Badge } from "../ui/Badge";
import { Section } from "../ui/Section";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Idle",
  running: "Running",
  paused: "Paused",
  done: "Done",
  failed: "Failed",
};

/** Phase, message, progress and details of the active simulation. */
export function StatusSection() {
  const status = useStore(statusStore);
  return (
    <Section title="Status">
      <div className="flex items-center gap-2">
        <Badge tone={status.phase}>{PHASE_LABELS[status.phase]}</Badge>
        <span className="text-sm text-muted">{status.message}</span>
      </div>
      {status.progress !== null && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(status.progress * 100)}
          className="h-1.5 w-full overflow-hidden rounded-full bg-raised"
        >
          <div
            className="h-full bg-accent transition-[width]"
            style={{ width: `${Math.round(status.progress * 100)}%` }}
          />
        </div>
      )}
      {status.details.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
          {status.details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-muted">{detail.label}</dt>
              <dd className="text-right tabular-nums">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
