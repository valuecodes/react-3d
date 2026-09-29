import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";

import { useSimulation } from "../../three/useSimulation";
import type { GridCell } from "./grid";
import { useGrid } from "./GridProvider";

/** The board of cells, its walls, the path line and the tracker sphere. */
export function GridScene() {
  const { mode, setMode, grid, meshes, pathLine, simulation } = useGrid();

  useSimulation(simulation);

  useFrame((_, delta) => {
    meshes.followTracker(
      simulation.cursor,
      simulation.showTracker(),
      Math.min(delta, 0.1)
    );
  });

  const cellAt = (
    event: ThreeEvent<PointerEvent | MouseEvent>
  ): GridCell | null =>
    event.instanceId === undefined
      ? null
      : (grid.cells[event.instanceId] ?? null);

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const cell = cellAt(event);
    if (!cell) return;
    if (mode === "start") {
      // Guide the user on: the target comes next, then back to orbiting.
      // A rejected cell (obstacle, or the other marker) keeps the mode.
      if (simulation.setStart(cell)) setMode("target");
    } else if (mode === "target") {
      if (simulation.setTarget(cell)) setMode("orbit");
    } else if (mode === "obstacle") {
      simulation.paintObstacle(cell);
    }
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    // Drag to paint: only while the primary button is held.
    if (mode !== "obstacle" || (event.buttons & 1) === 0) return;
    const cell = cellAt(event);
    if (cell) simulation.paintObstacle(cell);
  };

  return (
    <group>
      <primitive
        object={meshes.cells}
        onClick={onClick}
        onPointerMove={onPointerMove}
      />
      {meshes.walls && <primitive object={meshes.walls} />}
      <primitive object={pathLine.object} />
      <primitive object={meshes.tracker} />
    </group>
  );
}
