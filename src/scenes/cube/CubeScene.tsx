import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";

import { useSimulation } from "../../three/useSimulation";
import type { FaceMeshes } from "./cubeMeshes";
import { useCube } from "./CubeProvider";

/** The cube (or its net), the maze / pathfinding colours, the path line and the tracker. */
export function CubeScene() {
  const {
    meshes,
    pathLine,
    simulation,
    formation,
    showFrame,
    hideWalls,
    autoRotate,
    mode,
    setMode,
  } = useCube();

  useSimulation(simulation);

  // The path version last drawn; the line is rebuilt when it changes or while a face moves.
  const drawnVersion = useRef(-1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const moving = meshes.animateFormation(formation, dt);
    meshes.orientRoot(
      autoRotate && formation === "cube" ? simulation.activeFace : null,
      dt
    );
    if (moving || drawnVersion.current !== simulation.pathVersion) {
      drawnVersion.current = simulation.pathVersion;
      pathLine.setPath(meshes.rootLocalPoints(simulation.linePoints));
    }
    meshes.updateTracker(
      simulation.trackerActive() ? simulation.linePoints : [],
      simulation.cursor.progress,
      dt
    );
  });

  const pick = (face: FaceMeshes, event: ThreeEvent<MouseEvent>) => {
    if (mode === "orbit") return;
    const cell = face.cells[event.instanceId ?? -1];
    if (!cell) return;
    // Only the nearest face under the pointer takes the click.
    event.stopPropagation();
    if (mode === "start") simulation.setStart(cell);
    else simulation.setTarget(cell);
    setMode("orbit");
  };

  return (
    <primitive object={meshes.root}>
      {meshes.faces.map((face) => (
        <primitive
          key={face.name}
          object={face.group}
          onClick={(event: ThreeEvent<MouseEvent>) => pick(face, event)}
        >
          <primitive object={face.cellMesh} />
          {face.wallMesh && (
            <primitive object={face.wallMesh} visible={!hideWalls} />
          )}
        </primitive>
      ))}
      <primitive object={meshes.frame} visible={showFrame} />
      <primitive object={pathLine.object} />
      <primitive object={meshes.tracker} />
    </primitive>
  );
}
