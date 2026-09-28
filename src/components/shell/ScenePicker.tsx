import { cx } from "../../lib/cx";
import { toHash } from "../../lib/hashRoute";
import type { SceneDefinition } from "../../scenes/types";

type Props = {
  scenes: readonly SceneDefinition[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function ScenePicker({ scenes, activeId, onSelect }: Props) {
  return (
    <nav aria-label="Scenes" className="px-2 py-3">
      <h1 className="px-2 pb-2 text-base font-semibold">react-3d</h1>
      <ul className="flex flex-col gap-0.5">
        {scenes.map((scene) => {
          const active = scene.id === activeId;
          return (
            <li key={scene.id}>
              <a
                href={toHash(scene.id)}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(scene.id);
                }}
                className={cx(
                  "block rounded-md px-2 py-1.5 transition",
                  active ? "bg-accent/10 text-accent" : "hover:bg-raised"
                )}
              >
                <span className="block text-sm font-medium">{scene.name}</span>
                <span
                  className={cx(
                    "block text-xs",
                    active ? "text-accent/80" : "text-muted"
                  )}
                >
                  {scene.summary}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
