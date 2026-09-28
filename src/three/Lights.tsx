/** Lights are physically based since three r155; PI restores the legacy ambient level. */
export function Lights() {
  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[60, 90, 80]} intensity={0.8} />
    </>
  );
}
