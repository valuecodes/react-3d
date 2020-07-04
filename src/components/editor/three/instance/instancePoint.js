import * as React from 'react';
import * as THREE from 'three';
import { a } from 'react-spring/three';

const InstancePoints = ({ data, layout }) => {
  const meshRef = React.useRef();
  const numPoints = data.length;

  React.useEffect(() => {
    updateInstancedMeshMatrices({ mesh: meshRef.current, data });
  }, [data]);

  const { colorAttrib, colorArray } = usePointColors({ data});
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[null, null, numPoints]}
        frustumCulled={false}
      >
        <cylinderBufferGeometry attach="geometry" args={[2, 2, 2, 32]}>
          <instancedBufferAttribute
            ref={colorAttrib}
            attachObject={['attributes', 'color']}
            args={[colorArray, 3]}
          />
        </cylinderBufferGeometry>
        <meshStandardMaterial
          attach="material"
          vertexColors={'red'}
        />
      </instancedMesh>
    </>
  );
};

export default InstancePoints;


const scratchObject3D = new THREE.Object3D();

function updateInstancedMeshMatrices({ mesh, data }) {

  if (!mesh) return;

  const numPoints = data.length;
  const numCols = Math.ceil(Math.sqrt(numPoints));
  const numRows = numCols;

  // set the transform matrix for each instance
  for (let i = 0; i < data.length; ++i) {
    const { x, y, z } = data[i];

    const col = (i % numCols) - numCols / 2;
    const row = Math.floor(i / numCols) - numRows / 2;

    scratchObject3D.position.set(col * 5, row * 5 , 0 );
    scratchObject3D.rotation.set(0.5 * Math.PI, 0, 0); // cylinders face z direction
    scratchObject3D.updateMatrix();
    mesh.setMatrixAt(i, scratchObject3D.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
}

const SELECTED_COLOR = '#6f6';
const DEFAULT_COLOR = '#888';

// re-use for instance computations
const scratchColor = new THREE.Color();

const usePointColors = ({ data }) => {
  const numPoints = data.length;
  const colorAttrib = React.useRef();
  const colorArray = React.useMemo(() => new Float32Array(numPoints * 3), [
    numPoints,
  ]);

  React.useEffect(() => {
    for (let i = 0; i < data.length; ++i) {
      scratchColor.set(
         i%2===0?SELECTED_COLOR:DEFAULT_COLOR
      );
      scratchColor.toArray(colorArray, i * 3);
    }
    colorAttrib.current.needsUpdate = true;
  }, [data,colorArray]);

  return { colorAttrib, colorArray };
};



