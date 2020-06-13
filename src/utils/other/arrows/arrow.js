import React,{useState, useRef} from 'react'
import * as THREE from 'three'
import ReactDOM from 'react-dom'
import { Canvas, extend, useThree } from 'react-three-fiber'
import { Vector3 } from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'


// var dir = new THREE.Vector3( -Math.PI/2,0,0);
// var origin = new THREE.Vector3( 0, 0, 0 );
// var length = 5;
// var hex = 0xffff00;

export default function Arrow({current, arrow}) {
console.log(arrow)
    const { dir, origin, length, hex } = arrow
    const [selected, setSelected]=useState(false);
    const drag=useRef();
    const {
        camera,
        gl: { domElement }
    } = useThree()

    console.log(drag.current,current)

    return (
        <>
        {/* <mesh
        ref={drag}
        >
            <planeBufferGeometry attach="geometry" args={[5, 20, 32]}/>
            <meshBasicMaterial attach="material" color={'white'}/>            
        </mesh> */}

            <arrowHelper
                
                drag={e => console.log(e)}
                onClick={e => setSelected(!selected)}
                args={[dir, origin, length, selected?'red':'green']}
                />
            <dragControls args={[[current], camera, domElement]} /> 
        </>
    )
}
