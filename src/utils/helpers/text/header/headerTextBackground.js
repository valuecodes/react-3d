import React,{useRef, useEffect} from 'react'
import { disposeElements } from './../../../other/disposeElements'

export default function HeaderTextBackGround({position, text, renderer}) {

    const mesh=useRef();
    
    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    position[1]-=0.1
    return (
        <mesh
            ref={mesh}
            position={[55,0,-1]}
            rotation={[0,0,0]}
        >
            <planeBufferGeometry attach="geometry" args={[120, 20, 1]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.1}/>  
        </mesh>
    )
}
