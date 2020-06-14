import React,{useRef} from 'react'
import MeshEdit from './../../../../utils/edit/meshEdit'
import Three from '../three';

export default function BoxEdit() {

    const box = useRef();

    return (
        <mesh
            ref={box}
            onClick={e => console.log(box)}
        >
            <boxGeometry attach="geometry" args={[10, 10, 10]} />
            <meshBasicMaterial  attach="material" color='white'/>  
            <MeshEdit current={box}/>
        </mesh>
    )
}
