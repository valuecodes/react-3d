import { useStore } from "../../lib/store";
import { viewportStore } from "../../lib/viewportStore";

/** Floats over the canvas while the scene is in a non-orbit interaction mode. */
export function ModePill() {
  const { mode } = useStore(viewportStore);
  if (!mode) return null;
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-card/90 px-3 py-1 text-sm shadow-sm backdrop-blur"
    >
      <span className="font-medium text-accent">{mode.label}</span>
      <span className="text-muted">{mode.hint}</span>
    </div>
  );
}
