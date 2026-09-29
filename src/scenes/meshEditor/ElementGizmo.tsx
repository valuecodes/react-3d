import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Mesh, Object3D } from "three";
import type { Vector3 } from "three";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";

import { BOX_SIZE, useMeshEditor } from "./MeshEditorProvider";

/** What a drag is measured from: the positions and gizmo position at mouse-down. */
type Drag = {
  base: Float32Array;
  start: Vector3;
  vertices: readonly number[];
};

/**
 * A translate gizmo on the selected element. It drives a proxy object; every
 * change writes `snapshot + (proxy - start)` for the element's vertices, so
 * the mesh follows the gizmo without accumulating error.
 */
export function ElementGizmo() {
  const { mesh, selection, setSelection, showNormals, version, bumpVersion } =
    useMeshEditor();
  const gl = useThree((state) => state.gl);

  const proxy = useMemo(() => new Object3D(), []);
  const drag = useRef<Drag | null>(null);

  // The helper only reads the geometry's normals and the object's (identity)
  // world matrix, so a detached stand-in mesh sharing the geometry suffices.
  const helper = useMemo(
    () =>
      new VertexNormalsHelper(new Mesh(mesh.geometry), BOX_SIZE / 8, 0xef4444),
    [mesh]
  );
  useEffect(() => () => helper.dispose(), [helper]);

  // `version` is not read here: it re-runs the update after every edit.
  useEffect(() => {
    if (showNormals) helper.update();
  }, [helper, showNormals, version]);

  // Park the proxy on the selection, except while the gizmo is driving it.
  useEffect(() => {
    if (drag.current) return;
    mesh.topology.anchorOf(selection, proxy.position);
  }, [mesh, proxy, selection, version]);

  // Escape ends a drag in place (as a pointer-up would, which also hands
  // orbiting back), or clears the selection when nothing is being dragged.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      if (drag.current) {
        // drei's TransformControls comes from three-stdlib, which registers
        // its pointerup listener on the canvas's document (not the canvas, as
        // three's own copy does), so a synthetic pointerup there ends the drag
        // through the normal mouseUp / dragging-changed path.
        gl.domElement.ownerDocument.dispatchEvent(
          new PointerEvent("pointerup", { button: 0 })
        );
      } else {
        setSelection(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gl, setSelection]);

  const onMouseDown = () => {
    drag.current = {
      base: mesh.snapshot(),
      start: proxy.position.clone(),
      vertices: mesh.topology.verticesOf(selection),
    };
  };

  const onObjectChange = () => {
    const current = drag.current;
    if (!current) return;
    const delta = proxy.position.clone().sub(current.start);
    mesh.translate(current.vertices, current.base, delta);
    bumpVersion();
  };

  const onMouseUp = () => {
    drag.current = null;
    bumpVersion();
  };

  return (
    <>
      {/* TransformControls requires its object to be in the scene graph. */}
      <primitive object={proxy} />
      {selection && (
        <TransformControls
          object={proxy}
          mode="translate"
          size={0.8}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onObjectChange={onObjectChange}
        />
      )}
      {showNormals && <primitive object={helper} raycast={() => null} />}
    </>
  );
}
