export type HelperToggles = { grid: boolean; axes: boolean };

export function Helpers({ grid, axes }: HelperToggles) {
  return (
    <>
      {grid && <gridHelper args={[240, 24, "#9ca3af", "#d1d5db"]} />}
      {axes && <axesHelper args={[70]} />}
    </>
  );
}
