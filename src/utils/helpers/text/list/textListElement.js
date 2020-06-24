import React, { useState, useRef, useEffect } from 'react'
import usePromise from "react-promise-suspense"
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend, Canvas } from "react-three-fiber";
import TextBackGround from './textBackGround'
extend({ TextMesh });
export default function TextListElement({ text, position }) {

    const [currentText, setCurrentText] = useState("");
    const [visibility, setVisibility] = useState(false)
    
    const mesh=useRef();
    const background=useRef();

    useEffect(()=>{
        setCurrentText(text)
        // if(phase) setVisibility(true)
    },[text])

    if(mesh.current){
        mesh.current.up.x=1
        mesh.current.up.y=0     
        mesh.current.rotation.x=-Math.PI/2
        // mesh.current.geometry.instanceCount=30;
        mesh.current.geometry._maxInstanceCount=30;
    }

    return (
        <>
            <textMesh
                position={position}
                ref={mesh}
                onClick={e=>console.log(mesh)}
                text={currentText}
                fontSize={5}
                anchorX="center"
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>   <TextBackGround position={position}/>
            </textMesh>
        </>
    )
}
