import React, { useState, useRef, useEffect } from 'react'
import { TextMesh } from "troika-3d-text/dist/textmesh-standalone.umd.js";
import { extend } from "react-three-fiber";
import { disposeElements } from './../../../other/disposeElements'
import { calculateButtonPosition, updateCubeAnimation } from './../../../other/calculatePosition'
import { useFrame } from 'react-three-fiber'

extend({ TextMesh });

export default function Options(props) {
    const {
        options,
        renderer,
        // selectOption,
        cubes,
    } = props

    const mesh=useRef();

    const [animation, setAnimation]=useState(false)
    const [opt, setOpt]=useState([]);

    useEffect(()=>{
        let newOptions=[];
        newOptions = options.map(option => 
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
            if(ready) setAnimation(false)
        }
    })

    // if(listMesh===null&&mesh.current!==undefined){
    //     addListMesh(mesh.current.children)
    // }

    function selectOption(option){

        let updatedOpt=[...opt]

        let cubeCells=cubes.current
        
        if(option==='Show frame'){
            let current=opt.filter(opt => opt.option===option)
            let selected =current[0].selected
            console.log(current)
            {Object.keys(cubeCells).forEach((elem,index)=>
                cubeCells[elem].mesh.material.visible=selected
            )}
            current[0].selected = !selected
            updatedOpt[0]=current[0]
            setOpt(updatedOpt)
        }

        if(option==='Hide Walls'){
            let current=updatedOpt[2].selected
            console.log(current)
            {Object.keys(cubeCells).forEach((elem,index)=>
                cubeCells[elem].mesh.children.forEach(elem =>
                    elem.material.visible=current
                )
                // cubeCells[elem].mesh.material.visible=selected
            )}
            updatedOpt[2].selected = !current
            setOpt(updatedOpt)
        }

        if(option==='Open Cube'){
            let current=updatedOpt[1].selected
            console.log(cubeCells)
            // let selected =!current.selected
            if(!current){
                {Object.keys(cubeCells).forEach((elem,index)=>
                    [                
                        cubeCells[elem].targetPosition=cubeCells[elem].startingPosition,
                        cubeCells[elem].targetRotation=cubeCells[elem].startingRotation
                ]
                )}
                console.log(cubeCells,cubeCells.cubePosition)

            }else{
                {Object.keys(cubeCells).forEach((elem,index)=>
                    [                
                        cubeCells[elem].targetPosition=cubeCells[elem].cubePosition,
                        cubeCells[elem].targetRotation=cubeCells[elem].cubeRotation
                ]
                )}
            }
            // current[0].selected = !selected
            // updatedOpt[0]=current[0]
            
            setAnimation(true)

            updatedOpt[1].selected = !current
            setOpt(updatedOpt)
        }

    }

    console.log(options)
    // useEffect(()=>{
    //     return () => disposeElements(mesh.current, renderer)
    // },[])

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
    const mesh2=useRef();
    const background=useRef();

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

