import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide } from "three";

import { useGlobalOptions } from "../../../../../context/GlobalOptions";
import { createHexasphere } from "../shapes/hexasphere/hexasphere";
import { createPathLine } from "../shapes/hexasphere/pathline";
import { Simulation } from "../shapes/hexasphere/simulation";

/** The hexagon-tiled sphere and the maze / pathfinding algorithms that run on it. */
export default function HexaSphere() {
  const { options } = useGlobalOptions();
  const { sphere } = options;

  const hexasphere = useMemo(() => createHexasphere(sphere), [sphere]);
  useEffect(() => () => hexasphere.dispose(), [hexasphere]);

  const pathLine = useMemo(
    () => createPathLine(hexasphere.tiles.length, sphere.pathLine),
    [hexasphere, sphere.pathLine]
  );
  useEffect(() => () => pathLine.dispose(), [pathLine]);

  const simulation = useMemo(
    () => new Simulation(hexasphere, pathLine, sphere.detail),
    [hexasphere, pathLine, sphere.detail]
  );

  // Commands carry a sequence number; remember the last one handled so a
  // re-render (or a remount of this scene) never replays it.
  const handled = useRef({
    Obstacles: options.Obstacles?.seq ?? 0,
    Simulation: options.Simulation?.seq ?? 0,
  });

  useEffect(() => {
    simulation.setAlgorithm(options.Algorithm);
  }, [simulation, options.Algorithm]);

  useEffect(() => {
    const command = options.Obstacles;
    if (!command || command.seq === handled.current.Obstacles) return;
    handled.current.Obstacles = command.seq;
    simulation.setObstacles(command.value);
  }, [simulation, options.Obstacles]);

  useEffect(() => {
    const command = options.Simulation;
    if (!command || command.seq === handled.current.Simulation) return;
    handled.current.Simulation = command.seq;
    if (command.value === "Start") simulation.start();
    else simulation.reset();
  }, [simulation, options.Simulation]);

  useFrame(() => {
    simulation.tick();
  });

  const tileAt = (event: ThreeEvent<PointerEvent | MouseEvent>) =>
    hexasphere.faceToTile[event.faceIndex ?? -1];

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const tile = tileAt(event);
    if (!tile) return;
    if (options.Mode === "Add Start") simulation.setStart(tile);
    else if (options.Mode === "Add Target") simulation.setTarget(tile);
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
