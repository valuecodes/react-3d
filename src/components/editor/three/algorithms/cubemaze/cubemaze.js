import React, { useEffect, useState, useRef } from 'react'
import { 
    calculateCubePosition, 
    calculateTextHeaderPosition, 
    calculateListPosition,
    updateCubeAnimation,
    calculateGroupPosition,
    rotateToCurrentSide,
}from './../../../../../utils/other/calculatePosition'

import {
    resetCube
} from './../shapes/calculations'

import { disposeElements } from './../../../../../utils/other/disposeElements'
import { useSpring, animated, useTrail } from 'react-spring/three'

import ControlPanel from './../../panel/controlPanel'
import createNewCube from './../shapes/cube'
import CubeCells from './../shapes/cubecells'
import PathLine from './../shapes/pathLine'
import Tracker from './../shapes/tracker'
import MazeCreator from './../shapes/mazeCreator'

// let rotation = [-0.5, -0.90, 0];
let rotation = [0, 0, 0];

export default function CubeMaze2(props) {

    const [options, setOptions]=useState({
        size:10,
        cellSize:3,
        cubeSides:{
            top:true,
            front:true,
            right:true,
            // left:true,
            // back:true,
            // bot:true
        },
        obstacles:false,
        walls:true,
        wallsVisible:false,
        fullNeighbors:false,
        animation:false,
        automaticRotation:true,
        colorScheme:{
            initial:'#262729',
            wall:'#1a1a1a',
            current:'dimgray',
            next:'purple',
            closedSet:'salmon',
            openSet:'seagreen',
            path:'white',
            pathLine:'red',
            tracker:'red'
        }
    })

    const {
        position,
        renderer,
        cameraSettings
    } = props

    const [sideRotation, setSideRotation] = useSpring(() => ({
        rotation: [...rotation],
        config: { mass: 5, friction: 40, tension: 400 },
    }))

    const [controlPanelOptions, setControlPanelOptions]=useState({
        list:['Maze Creator'],
        buttons:['Start', 'Pause', 'Reset'],
        options:['Show frame','Open Cube','Hide Walls']
    })


    const [cubeCells, setCubeCells] = useState([]);
    const [sides, setSides]=useState([]);

    const [state, setState]=useState({
        maze:false,
        pause:false,
        aStar:false,
        ready:false,
        animation:false,
        tracking:false,
    })        
    let newState={...state} 

    const cubes=useRef();
    const mesh=useRef();
    const controlPanel=useRef();
    const group=useRef();
    const pathLine=useRef();
    const tracker=useRef();
    let aStarRef=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    useEffect(()=>{

        createNew()
    
        setTimeout(()=>{
            newState.animation=true
            setState(newState)      
        },[2000])
        return () => {
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current,renderer)
        }
    },[])
    
    function createNew(newSize){
        let newCubeCells = createNewCube(options);
        cubes.current=newCubeCells[0];
        setCubeCells(newCubeCells[0]) 
        setSides(newCubeCells[1])
    }
 
    function buttonClick(action){
   
        if(action==='Start'){
            newState.maze=true
            newState.pause=false
        }

        if(action==='Pause'){
            newState.pause=!newState.pause
        }

        if(action==='Reset'){
            resetCube(cubes,sides,pathLine,options,aStarRef,tracker)
            newState.maze=false
            newState.pause=false
            newState.ready=false
            newState.aStar=false
        }

        setState(newState)
    }

    function automaticRotation(current){
        let target=rotateToCurrentSide(group,current)
        if(target){
            setSideRotation({ rotation: [target.x-0.5,target.y-0.9,target.z] });
        }
    }

    function updateSliderValue(newValue){
        if(newValue!==options.size){
            console.log(newValue)
            // resetCube()
            // createNew([newValue,newValue])
            // setSize([newValue,newValue])
            // setAnimation(true);
        }
    }
    console.log(cubeCells)
    return (
        <>
            <animated.group
                {...sideRotation}
                ref={group}
                position={calculateGroupPosition(options.size,options.cellSize)}
            >
                <group
                ref={mesh}
                position={calculateCubePosition(options.size,options.cellSize)}
                >
                    <CubeCells cubeCells={cubeCells} />
                    <MazeCreator
                        state={state}
                        setState={setState}
                        cubes={cubes}
                        sides={sides}
                        controlPanel={controlPanel}
                        options={options}
                        automaticRotation={automaticRotation}
                    />
                </group>
            </animated.group>

            <ControlPanel 
                controlPanelOptions={controlPanelOptions}
                controlPanel={controlPanel}
                renderer={renderer}
                buttonClick={buttonClick}
                cubes={cubes}
                pathLine={pathLine}
                aStarRef={aStarRef}
                options={options}
                tracker={tracker}
                updateSliderValue={updateSliderValue}
            />
        </>
    )
}
