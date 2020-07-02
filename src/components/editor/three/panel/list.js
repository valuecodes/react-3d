import React, { useState, useRef, useEffect } from 'react'
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend } from "react-three-fiber";
import { disposeElements } from './../../../../utils/other/disposeElements'
import { calculateListPosition } from './../../../../utils/other/calculatePosition'
extend({ TextMesh });

export default function List(props) {
    const {
        position,
        size, 
        listMesh, 
        addListMesh, 
        renderer,
        list
    } = props

    const mesh=useRef();

    if(listMesh===null&&mesh.current!==undefined){
        addListMesh(mesh.current.children)
    }

    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    return (
        <mesh
            ref={mesh}
            name={'list'}
        >
            {list.map((elem, index)=>
                <ListElement text={elem} position={
                    calculateListPosition(size,position,index)
                }
                renderer={renderer}
                />
            )}            
        </mesh>
    )
}


function ListElement({ text, position, renderer }) {

    const [currentText, setCurrentText] = useState("");
    
    const mesh=useRef();
    const mesh1=useRef();
    const mesh2=useRef();
    const background=useRef();

    useEffect(()=>{
        return () =>{
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current, renderer)
        } 
    },[])

    useEffect(()=>{
        setCurrentText(text)
    },[text])

    if(mesh.current){  
        mesh1.current.geometry._maxInstanceCount=30;
        mesh2.current.geometry._maxInstanceCount=30;
    }

    return (
        <group      
            ref={mesh}              
            position={position}
            rotation={[-Math.PI/2,0,0]}
        >
            <textMesh    
                ref={mesh1}
                onClick={e=>console.log(mesh)}
                text={''}
                fontSize={5}
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>     
            </textMesh> 

            <textMesh    
                position={[-40,0,0]}
                ref={mesh2}
                onClick={e=>console.log(mesh)}
                text={currentText}
                fontSize={5}
                anchorX="left"
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>     
            </textMesh> 
            <BackGround position={position} renderer={renderer}/>
        </group>
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

