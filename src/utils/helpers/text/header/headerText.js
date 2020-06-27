import React, { useState, useRef, useEffect } from 'react'
import usePromise from "react-promise-suspense"
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend, Canvas } from "react-three-fiber";
import { disposeElements } from './../../../other/disposeElements'
extend({ TextMesh });

export default function HeaderText({ text, position, renderer }) {
    const [currentText, setCurrentText] = useState("");
    
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
                position={position}
                rotation={[-Math.PI/2,0,0]}
                ref={mesh}
                onClick={e=>console.log(mesh)}
                text={currentText}
                fontSize={10}
                // anchorX="center"
                anchorY="middle"
                // visible={visibility}
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>   <HeaderTextBackGround position={position} text={text} renderer={renderer}/>
            </textMesh>


        </>

    )
}

function HeaderTextBackGround({position, text, renderer}) {

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

