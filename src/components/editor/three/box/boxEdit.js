import React,{useRef} from 'react'
import MeshEdit from './../../../../utils/edit/meshEdit'
import Three from '../three';

export default function BoxEdit() {

    const box = useRef();

    return (
        <mesh
            ref={box}
        >
            <boxGeometry attach="geometry" args={[20, 20, 20]} />
            <meshBasicMaterial  attach="material" color='rgb(179, 181, 179)'/>  
            <MeshEdit current={box}/>
        </mesh>
    )
}
