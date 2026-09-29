import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

import { HandleSet } from "./handles";
import { BOX_SIZE, useMeshEditor } from "./MeshEditorProvider";
import type { ElementKind } from "./topology";

/**
 * The pick targets for the active element kind and the edge lines. A click on
 * a handle selects that instance; the lines never take part in picking.
 */
export function Handles() {
  const { mesh, mode, selection, setSelection, version } = useMeshEditor();

  const handles = useMemo(() => new HandleSet(mesh.topology, BOX_SIZE), [mesh]);
  useEffect(() => () => handles.dispose(), [handles]);

  // `version` is not read here: it re-runs the refresh after every edit.
  useEffect(() => {
    handles.refresh(selection);
  }, [handles, selection, version]);

  const pick = (kind: ElementKind) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const index = event.instanceId;
    if (index === undefined) return;
    setSelection({ kind, index });
  };

  return (
    <group>
      {mode === "vertex" && (
        <primitive object={handles.vertices} onClick={pick("vertex")} />
      )}
      {mode === "edge" && (
        <primitive object={handles.edges} onClick={pick("edge")} />
      )}
      {mode === "face" && (
        <primitive object={handles.faces} onClick={pick("face")} />
      )}
      <primitive object={handles.lines} raycast={() => null} />
    </group>
  );
}
