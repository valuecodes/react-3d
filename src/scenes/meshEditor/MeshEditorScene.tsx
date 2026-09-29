import type { ThreeEvent } from "@react-three/fiber";

import { ElementGizmo } from "./ElementGizmo";
import { Handles } from "./Handles";
import { useMeshEditor } from "./MeshEditorProvider";

/** The editable box, its pick handles and the translate gizmo. */
export function MeshEditorScene() {
  const { mesh, wireframe } = useMeshEditor();

  // react-three-fiber only raycasts objects with handlers, so the box needs
  // one to occlude the handles behind it; otherwise a click on a face would
  // select a hidden vertex on the far side.
  const occlude = (event: ThreeEvent<MouseEvent>) => event.stopPropagation();

  return (
    <group>
      <mesh geometry={mesh.geometry} onClick={occlude}>
        <meshStandardMaterial color="#93c5fd" wireframe={wireframe} />
      </mesh>
      <Handles />
      <ElementGizmo />
    </group>
  );
}
