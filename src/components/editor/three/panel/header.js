import React, { useState, useRef, useEffect } from 'react'

import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend } from "react-three-fiber";
import { disposeElements } from './../../../../utils/other/disposeElements'
extend({ TextMesh });

export default function HeaderText({ text, renderer }) {
    const [currentText, setCurrentText] = useState("")
    const mesh=useRef();

    useEffect(()=>{
        setCurrentText(text)
    },[text])

    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    if(mesh.current){  
        mesh.current.geometry._maxInstanceCount=30;
    }

    return (
        <>
            <textMesh
                rotation={[-Math.PI/2,0,0]}
                ref={mesh}
                text={currentText}
                fontSize={10}
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>   
                <HeaderTextBackGround text={text} renderer={renderer}/>
            </textMesh>
        </>

    )
}

function HeaderTextBackGround({ text, renderer}) {
    const mesh=useRef();
    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])
    return (
        <mesh
            position={[55,0,-1]}
            rotation={[0,0,0]}
            ref={mesh}
        >
            <planeBufferGeometry attach="geometry" args={[120, 20, 1]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.1}/>  
        </mesh>
    )
}
