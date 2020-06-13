import React,{useRef} from 'react'
import MeshEdit from './../../../../utils/edit/meshEdit'
import Three from '../three';

export default function Plane() {

    const box = useRef();

    return (
        <mesh
            ref={box}
            onClick={e => console.log(box)}
        >
            <planeGeometry attach="geometry" args={[20, 20, 2]} />
            <meshBasicMaterial  attach="material" color='red' side={2}/>  
            <MeshEdit current={box}/>
        </mesh>
    )
}
