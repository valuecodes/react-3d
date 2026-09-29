import { Dot, Minus, Triangle } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Kbd } from "../../components/ui/Kbd";
import { Section } from "../../components/ui/Section";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import type { SegmentedOption } from "../../components/ui/SegmentedControl";
import { useMeshEditor } from "./MeshEditorProvider";
import type { ElementKind, Selection } from "./topology";

const MODE_OPTIONS: readonly SegmentedOption<ElementKind>[] = [
  { value: "vertex", label: "Vertex", icon: Dot },
  { value: "edge", label: "Edge", icon: Minus },
  { value: "face", label: "Face", icon: Triangle },
];

const KIND_LABELS: Record<ElementKind, string> = {
  vertex: "Vertex",
  edge: "Edge",
  face: "Face",
};

function describe(selection: Selection): string {
  if (!selection) return "Nothing selected";
  return `${KIND_LABELS[selection.kind]} ${selection.index} selected`;
}

export function MeshEditorPanel() {
  const {
    mode,
    setMode,
    selection,
    showNormals,
    setShowNormals,
    wireframe,
    setWireframe,
    resetMesh,
  } = useMeshEditor();

  return (
    <>
      <Section title="Element">
        <SegmentedControl
          label="Element"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
        />
        <p className="text-sm text-ink" aria-live="polite">
          {describe(selection)}
        </p>
        <p className="text-sm text-muted">
          Click a handle to select it, then drag the gizmo arrows.{" "}
          <Kbd>Esc</Kbd> ends a drag or clears the selection.
        </p>
      </Section>

      <Section title="Display">
        <div className="flex gap-2">
          <Button
            pressed={showNormals}
            onClick={() => setShowNormals(!showNormals)}
          >
            Show normals
          </Button>
          <Button pressed={wireframe} onClick={() => setWireframe(!wireframe)}>
            Wireframe
          </Button>
        </div>
      </Section>

      <Section title="Actions">
        <Button onClick={resetMesh}>Reset mesh</Button>
      </Section>
    </>
  );
}
