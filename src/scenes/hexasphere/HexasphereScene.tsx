import type { ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";

import { useSimulation } from "../../three/useSimulation";
import { useHexasphere } from "./HexasphereProvider";

/** The hexagon-tiled sphere and the maze / pathfinding algorithms that run on it. */
export function HexasphereScene() {
  const { options, setOption, hexasphere, pathLine, simulation } =
    useHexasphere();

  useSimulation(simulation);

  const tileAt = (event: ThreeEvent<PointerEvent | MouseEvent>) =>
    hexasphere.faceToTile[event.faceIndex ?? -1];

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const tile = tileAt(event);
    if (!tile) return;
    if (options.Mode === "Add Start") {
      simulation.setStart(tile);
      // Guide the user on: the target comes next, then back to orbiting.
      setOption({
        key: "Mode",
        value: simulation.targetTile ? "Rotate" : "Add Target",
      });
    } else if (options.Mode === "Add Target") {
      simulation.setTarget(tile);
      setOption({ key: "Mode", value: "Rotate" });
    }
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    // Drag to paint: only while the primary button is held.
    if (options.Mode !== "AddWalls" || (event.buttons & 1) === 0) return;
    const tile = tileAt(event);
    if (tile) simulation.paintObstacle(tile);
  };

  return (
    <group>
      <mesh
        geometry={hexasphere.tileGeometry}
        onClick={onClick}
        onPointerMove={onPointerMove}
      >
        <meshPhongMaterial vertexColors side={DoubleSide} alphaTest={0.5} />
      </mesh>
      {/* Walls sit just above the tiles and never take part in picking. */}
      <mesh
        geometry={hexasphere.wallGeometry}
        scale={1.0005}
        raycast={() => null}
      >
        <meshStandardMaterial vertexColors side={DoubleSide} alphaTest={0.5} />
      </mesh>
      <primitive object={pathLine.object} />
    </group>
  );
}
