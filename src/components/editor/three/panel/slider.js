import React, { useState, useRef, useEffect } from 'react'
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend } from "react-three-fiber";
import { disposeElements } from './../../../../utils/other/disposeElements'
import { calculateListPosition } from './../../../../utils/other/calculatePosition'
import DragControl from './../../../../utils/other/dragControl'

extend({ TextMesh });


export default function Slider(props) {

    const {
        renderer,
        updateSliderValue
    } = props

    const mesh=useRef();

    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    return (
         <group
            ref={mesh}
            rotation={[-Math.PI/2,0,0]}
            position={[40,0,65]}
         >
            <DragPoint renderer={renderer} updateSliderValue={updateSliderValue}/>
            <BackGround position={[0,0,0]}/>
         </group>
    )
}

function DragPoint({renderer, updateSliderValue}) {
    const mesh=useRef();
    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])
    return (
        <mesh
            ref={mesh}
        >
            <boxGeometry attach="geometry" args={[3, 3, 3]} />
            <meshNormalMaterial attach="material" color='white'/>
            <DragControl current={mesh.current} updateSliderValue={updateSliderValue}/>
        </mesh>

    )
}


function BackGround({position, renderer}) {
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
            <planeBufferGeometry attach="geometry" args={[90, 10, 2]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.4}/>  
        </mesh>
    )
}