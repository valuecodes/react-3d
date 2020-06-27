import React,{useRef, useEffect, useState} from 'react'
// import TextListElement from './textListElement'
import { calculateButtonPosition }from './../../../other/calculatePosition'
import { disposeElements } from './../../../other/disposeElements'

export default function Buttons(props) {

    const {
        position,
        list,
        size, 
        listMesh, 
        addListMesh, 
        renderer,
        buttonClick
    } = props

    const mesh=useRef();
    const [buttons, setButtons]=useState(['Start', 'Pause', 'Reset'])

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
            {buttons.map((button, index)=>
                <Button text={button} 
                    position={calculateButtonPosition(size,position,index)}
                    renderer={renderer}
                    buttonClick={buttonClick}
                />
            )}            
        </mesh>
    )
}

function Button(props){

    const {
        text, 
        position, 
        renderer,
        buttonClick
    } = props

    return (
        <mesh
            name={'list'}
        >
            <textMesh
                position={position}
                rotation={[-Math.PI/2,0,0]}
                text={text}
                fontSize={5}
                anchorX="center"
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>

                  <ButtonBackGround 
                    position={position} 
                    renderer={renderer}
                    action={text}
                    buttonClick={buttonClick}
                />
            </textMesh>
        </mesh>
    )
}

function ButtonBackGround(props) {

    const {
        position, 
        text, 
        renderer, 
        action,
        buttonClick
    } = props

    const mesh=useRef();
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
            position={[0,0,-1]}
            onPointerOver={e => hoverColor(e,'in')}
            onPointerOut={e => hoverColor(e,'out')}
            onClick={e=>buttonClick(action)}
        >
            <planeBufferGeometry attach="geometry" args={[25, 10, 1]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.1}/>  
        </mesh>
    )
}