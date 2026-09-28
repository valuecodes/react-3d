import { PanelLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useHashRoute } from "../../lib/useHashRoute";
import { findScene, scenes } from "../../scenes/registry";
import type { CameraPreset } from "../../scenes/types";
import { presetsFor } from "../../three/camera";
import type { CameraCommand } from "../../three/camera";
import type { HelperToggles } from "../../three/Helpers";
import { Viewport } from "../../three/Viewport";
import { CameraPanel } from "./CameraPanel";
import { ScenePicker } from "./ScenePicker";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [routeId, navigate] = useHashRoute();
  const scene = findScene(routeId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpers, setHelpers] = useState<HelperToggles>({
    grid: false,
    axes: false,
  });
  const [orbit, setOrbit] = useState(true);
  const [command, setCommand] = useState<CameraCommand | null>(null);
  const presets = useMemo(() => presetsFor(scene.camera), [scene]);

  // Make the default scene linkable: an empty hash becomes the first scene's.
  useEffect(() => {
    if (routeId === null) navigate(scene.id);
  }, [routeId, navigate, scene.id]);

  const onPreset = useCallback((preset: CameraPreset) => {
    setCommand((previous) => ({
      seq: (previous?.seq ?? 0) + 1,
      kind: "goto",
      position: preset.position,
      target: preset.target ?? [0, 0, 0],
    }));
  }, []);

  const onOrbit = useCallback((yaw: number) => {
    setCommand((previous) => ({
      seq: (previous?.seq ?? 0) + 1,
      kind: "orbit",
      yaw,
    }));
  }, []);

  const onSelect = useCallback(
    (id: string) => {
      navigate(id);
      setSidebarOpen(false);
    },
    [navigate]
  );

  return (
    <scene.Provider key={scene.id}>
      <div className="flex h-dvh overflow-hidden bg-page">
        <button
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
          className="fixed top-3 left-3 z-30 rounded-md border border-line bg-card p-2 shadow-sm md:hidden"
        >
          <PanelLeft className="size-5" aria-hidden />
        </button>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <ScenePicker
            scenes={scenes}
            activeId={scene.id}
            onSelect={onSelect}
          />
          <div className="border-t border-line">
            <scene.Panel />
          </div>
          <div className="mt-auto border-t border-line">
            <CameraPanel
              presets={presets}
              helpers={helpers}
              orbit={orbit}
              onPreset={onPreset}
              onOrbit={onOrbit}
              onToggleHelper={(key) =>
                setHelpers((current) => ({ ...current, [key]: !current[key] }))
              }
              onToggleOrbit={() => setOrbit((current) => !current)}
            />
          </div>
        </Sidebar>
        <Viewport
          scene={scene}
          helpers={helpers}
          command={command}
          orbitToggle={orbit}
        />
      </div>
    </scene.Provider>
  );
}
