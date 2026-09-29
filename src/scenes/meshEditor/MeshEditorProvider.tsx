import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { idleStatus, statusStore } from "../../lib/statusStore";
import { createEditableBox } from "./editableMesh";
import type { EditableMesh } from "./editableMesh";
import type { ElementKind, Selection } from "./topology";

export const BOX_SIZE = 40;

export type MeshEditorStore = {
  mesh: EditableMesh;
  mode: ElementKind;
  /** Switches the handle set; the selection is cleared because it belongs to the old kind. */
  setMode: (mode: ElementKind) => void;
  selection: Selection;
  setSelection: (selection: Selection) => void;
  showNormals: boolean;
  setShowNormals: (show: boolean) => void;
  wireframe: boolean;
  setWireframe: (wireframe: boolean) => void;
  /** Bumped after every geometry edit so handles, lines and helpers re-read the positions. */
  version: number;
  bumpVersion: () => void;
  resetMesh: () => void;
};

const MeshEditorContext = createContext<MeshEditorStore | null>(null);

/** Owns the editable box and the editor's UI state for both the panel and the scene. */
export function MeshEditorProvider({ children }: { children: ReactNode }) {
  const mesh = useMemo(() => createEditableBox(BOX_SIZE), []);
  useEffect(() => () => mesh.dispose(), [mesh]);

  const [mode, setModeState] = useState<ElementKind>("vertex");
  const [selection, setSelection] = useState<Selection>(null);
  const [showNormals, setShowNormals] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [version, setVersion] = useState(0);

  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);

  const setMode = useCallback((next: ElementKind) => {
    setModeState(next);
    setSelection(null);
  }, []);

  const resetMesh = useCallback(() => {
    mesh.reset();
    bumpVersion();
  }, [mesh, bumpVersion]);

  // No simulation here: the status line only carries the instructions.
  useEffect(() => {
    statusStore.set(idleStatus("Select an element and drag the gizmo"));
    return () => statusStore.set(idleStatus());
  }, []);

  const store = useMemo<MeshEditorStore>(
    () => ({
      mesh,
      mode,
      setMode,
      selection,
      setSelection,
      showNormals,
      setShowNormals,
      wireframe,
      setWireframe,
      version,
      bumpVersion,
      resetMesh,
    }),
    [
      mesh,
      mode,
      setMode,
      selection,
      showNormals,
      wireframe,
      version,
      bumpVersion,
      resetMesh,
    ]
  );

  return (
    <MeshEditorContext.Provider value={store}>
      {children}
    </MeshEditorContext.Provider>
  );
}

export function useMeshEditor(): MeshEditorStore {
  const store = useContext(MeshEditorContext);
  if (!store)
    throw new Error("useMeshEditor must be used inside MeshEditorProvider");
  return store;
}
