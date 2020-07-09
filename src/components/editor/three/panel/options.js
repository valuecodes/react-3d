import React, { useState, useRef, useEffect } from 'react'
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend } from "react-three-fiber";
import { disposeElements } from './../../../../utils/other/disposeElements'
import { 
    updateCubeAnimation,
} from './../../../../utils/other/calculatePosition'
import {
    updatePathPosition,
    updateTrackerPosition
} from './../../../../components/editor/three/algorithms/shapes/calculations'
import { useFrame } from 'react-three-fiber'

extend({ TextMesh });

export default function Options(props) {
    
    const {
        options,
        renderer,
        cubes,
        pathLine,
        aStarRef,
        controlPanelOptions,
        tracker
    } = props

    const mesh=useRef();

    const [animation, setAnimation]=useState(false)
    const [opt, setOpt]=useState([]);

    useEffect(()=>{
        let newOptions=[];
        newOptions = controlPanelOptions.map(option => 
            option={
                option:option,
                selected:false
            }
        )
        setOpt(newOptions)
    },[])

    useFrame(()=>{
        if(animation){
            let blocks=cubes.current
            let speed=5
            let rotationSpeed=0.1
            let ready = updateCubeAnimation(blocks,speed,rotationSpeed)
            // console.log(aStarRef)
            updatePathPosition(aStarRef.current.path,blocks,pathLine,options,opt[1].selected)
            updateTrackerPosition(tracker,aStarRef.current.path)
            if(ready) setAnimation(false)
        }
    })

    function selectOption(option){

        let updatedOpt=[...opt]

        let cubeCells=cubes.current
        
        if(option==='Show frame'){
            let current=opt.filter(opt => opt.option===option)
            let selected =current[0].selected

            {Object.keys(cubeCells).forEach((elem,index)=>
                cubeCells[elem].mesh.material.visible=selected
            )}
            current[0].selected = !selected
            updatedOpt[0]=current[0]
            setOpt(updatedOpt)
        }

        if(option==='Hide Walls'){
            let current=updatedOpt[2].selected

            {Object.keys(cubeCells).forEach((elem,index)=>
                cubeCells[elem].mesh.children.forEach(elem =>
                    elem.material.visible=current
                )
            )}
            updatedOpt[2].selected = !current
            setOpt(updatedOpt)
        }

        if(option==='Open Cube'){
            let current=updatedOpt[1].selected

            if(!current){
                Object.keys(cubeCells).forEach(elem =>
                        cubeCells[elem].targetFormation=cubeCells[elem].openFormation,
                )
            }else{
                Object.keys(cubeCells).forEach(elem =>        
                        cubeCells[elem].targetFormation=cubeCells[elem].cubeFormation,
                )
            }       
            setAnimation(true)

            updatedOpt[1].selected = !current
            setOpt(updatedOpt)
        }

    }

    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    return (
        <group 
            ref={mesh}
            name={'options'}
            position={[60,0,50]}
        >
            {opt.map((option, index)=>
                <Option 
                    option={option} 
                    position={[-60+30*index,0,0]}
                    renderer={renderer}
                    selectOption={selectOption}
                />
            )}            
        </group >
    )
}


function Option(props) {

    const {
        option, 
        position, 
        renderer,
        selectOption,
    } = props

    const optionName=option.option
    const selected=option.selected

    const mesh=useRef();
    const mesh1=useRef();

    useEffect(()=>{
        return () =>{
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current, renderer)
        } 
    },[])


    if(mesh.current){  
        mesh1.current.geometry._maxInstanceCount=30;
        // mesh2.current.geometry._maxInstanceCount=30;
    }

    return (
        <mesh      
            ref={mesh}              
            position={position}
            rotation={[-Math.PI/2,0,0]}
        >
            <textMesh    
                ref={mesh1}
                onClick={e=>selectOption(optionName)}
                text={optionName}
                fontSize={4}
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>     
            </textMesh> 

            {/* <textMesh    
                position={[-40,0,0]}
                ref={mesh2}
                onClick={e=>console.log(mesh)}
                text={currentText}
                fontSize={5}
                anchorX="left"
                anchorY="middle"
            >
                <meshPhongMaterial attach="material" color="black" side={2}/>     
            </textMesh>  */}
            <BackGround position={position} renderer={renderer} selected={selected}/>
        </mesh>
    )
}

function BackGround({position, renderer, selected}) {
    const mesh=useRef();
    position[1]-=0.1
    
    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    // function hoverColor(e,dir){
    //     if(dir==='in') e.object.material.color.set('green')
    //     if(dir==='out') e.object.material.color.set('gray')
    // }

    return (
        <mesh
            ref={mesh}
            // onPointerOver={e => hoverColor(e,'in')}
            // onPointerOut={e => hoverColor(e,'out')}
            position={[10,0,-1]}
        >
            <planeBufferGeometry attach="geometry" args={[30, 10, 2]} />
            <meshBasicMaterial  attach="material" color={selected?'green':'gray'} transparent={true} side={2} opacity={0.4}/>  
        </mesh>
    )
}

