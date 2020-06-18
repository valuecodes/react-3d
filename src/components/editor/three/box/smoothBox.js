import React,{useRef, useState} from 'react'
import MeshEdit from './../../../../utils/edit/meshEdit'

import * as THREE from 'three'

export default function SmoothBox() {

    let [ round, setRound ] = useState(1); 
    const box = useRef();

    function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
        let shape = new THREE.Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
        shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
        shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
        shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );

        let settings={          
            amount: depth - radius0 * 2,
            bevelEnabled: true,
            bevelSegments: smoothness * 2,
            steps: 1,
            bevelSize: radius,
            bevelThickness: radius0,
            curveSegments: smoothness}
        
        return [shape, settings];
      }
        
      console.log(round)
    return (
        <mesh
            ref={box}
            onClick={e => setRound(round+=1)}
        >
            <extrudeBufferGeometry
            attach="geometry"
                args={createBoxWithRoundedEdges( 10, 10, 10, round, 2 )}
            />
            {/* <boxGeometry attach="geometry" args={[20, 20, 20]} /> */}
            <meshStandardMaterial 
                attach="material" 
                color='green' 
                // metalness='1'
                roughness='2'
                // wireframe
            />
            {/* <MeshEdit current={box}/> */}
        </mesh>
    )
}
