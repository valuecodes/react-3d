import React, { useState, useRef, useEffect } from 'react'
import usePromise from "react-promise-suspense"
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend, Canvas } from "react-three-fiber";
import HeaderTextBackGround from './headerTextBackground'
extend({ TextMesh });

export default function HeaderText({ text, position }) {
    const [currentText, setCurrentText] = useState("");
    
    const mesh=useRef();

    useEffect(()=>{
        setCurrentText(text)
    },[text])

    if(mesh.current){  
        mesh.current.rotation.x=-Math.PI/2
        mesh.current.geometry._maxInstanceCount=30;
    }

    return (
        <>
            <textMesh
                position={position}
                // rotate={[-Math.PI/2,0,0]}
                ref={mesh}
                onClick={e=>console.log(mesh)}
                text={currentText}
                fontSize={10}
                // anchorX="center"
                anchorY="middle"
                // visible={visibility}
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>   <HeaderTextBackGround position={position} text={text}/>
            </textMesh>


        </>

    )
}
