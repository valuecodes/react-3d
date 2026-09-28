export type CameraSettings = {
  cameraPosition: readonly [number, number, number];
  cameraRotation: readonly [number, number, number];
  orbit: boolean;
  axes: boolean;
  grid: boolean;
  mode: "orbit" | "add" | "edit";
};

type Props = {
  cameraSettings: CameraSettings;
  changeCameraSettings: <K extends keyof CameraSettings>(
    key: K,
    value: CameraSettings[K]
  ) => void;
};

/** The button grid on the right: camera presets, scene rotation and helper toggles. */
export default function CameraControls({
  cameraSettings,
  changeCameraSettings,
}: Props) {
  const { cameraRotation, orbit, grid, axes } = cameraSettings;

  const rotate = (degrees: number) => {
    const [x, y, z] = cameraRotation;
    changeCameraSettings("cameraRotation", [
      x,
      y + degrees * (Math.PI / 180),
      z,
    ]);
  };

  return (
    <div className="cameraControls">
      <button
        className="initial"
        onClick={() => changeCameraSettings("cameraPosition", [0, 90, 120])}
      >
        Initial
      </button>
      <button
        className="back"
        onClick={() => changeCameraSettings("cameraPosition", [0, 0, -120])}
      >
        Back
      </button>
      <button
        className="front"
        onClick={() => changeCameraSettings("cameraPosition", [0, 0, 120])}
      >
        Front
      </button>
      <button
        className="top"
        onClick={() => changeCameraSettings("cameraPosition", [0, 90, 0])}
      >
        Top
      </button>
      <button
        className="bot"
        onClick={() => changeCameraSettings("cameraPosition", [0, -90, 0])}
      >
        Bot
      </button>
      <button className="rLeft" onClick={() => rotate(90)}>
        Rotate left
      </button>
      <button className="rRight" onClick={() => rotate(-90)}>
        Rotate right
      </button>
      <button
        onClick={() => changeCameraSettings("orbit", !orbit)}
      >{`Orbit controls ${orbit}`}</button>
      <button
        className="grid"
        onClick={() => changeCameraSettings("grid", !grid)}
      >
        Grid
      </button>
      <button
        className="axes"
        onClick={() => changeCameraSettings("axes", !axes)}
      >
        Axes
      </button>
      <button
        className="orbit"
        onClick={() => changeCameraSettings("mode", "orbit")}
      >
        Orbit
      </button>
      <button
        className="add"
        onClick={() => changeCameraSettings("mode", "add")}
      >
        Add
      </button>
      <button
        className="edit"
        onClick={() => changeCameraSettings("mode", "edit")}
      >
        Edit
      </button>
    </div>
  );
}
