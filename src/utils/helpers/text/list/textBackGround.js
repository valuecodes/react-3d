import React,{useRef, useEffect} from 'react'
import { disposeElements } from './../../../other/disposeElements'

export default function TextBackGround({position, renderer}) {
    const mesh=useRef();
    position[1]-=0.1
    
    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    function hoverColor(e,dir){
        if(dir==='in') e.object.material.color.set('green')
        if(dir==='out') e.object.material.color.set('gray')
    }

    return (
        <mesh
            ref={mesh}
            onPointerOver={e => hoverColor(e,'in')}
            onPointerOut={e => hoverColor(e,'out')}
            position={[0,0,-1]}
        >
            <planeBufferGeometry attach="geometry" args={[80, 10, 2]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.4}/>  
        </mesh>
    )
}
