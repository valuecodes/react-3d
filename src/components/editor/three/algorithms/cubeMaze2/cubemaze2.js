import React, { useEffect, useState, useRef } from 'react'
import createNewCube from './cubeSide'
import { useFrame } from 'react-three-fiber'
import { 
    calculateCubePosition, 
    calculateTextHeaderPosition, 
    calculateListPosition,
    updateCubeAnimation,
    calculateGroupPosition,
    rotateToCurrentSide,
}from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/text/header/headerText'
import Buttons from './../../../../../utils/helpers/text/buttons/buttons'
import { disposeElements } from './../../../../../utils/other/disposeElements'
import { useSpring, animated, useTrail } from 'react-spring/three'
import ControlPanel from './../../../../../utils/helpers/text/panel/controlPanel'

let rotation = [-0.5, -0.90, 0];

export default function CubeMaze2(props) {

    const {
        // size,
        position,
        renderer,
        cameraSettings
    } = props

    const [sideRotation, setSideRotation] = useSpring(() => ({
        rotation: [...rotation],
        config: { mass: 5, friction: 40, tension: 400 },
      }))

    const [gridCells, setGridCells] = useState([]);
    const [start, setStart]=useState(false)
    const [pause, setPause]=useState(false)
    const [currentPos, setCurrentPos]=useState([])
    const [cubeSize, setCubeSize]=useState(null);
    const [animation, setAnimation]=useState(false)
    const [size, setSize]=useState([7,7])

    const [controlPanelOptions, setControlPanelOptions]=useState({
        list:['Maze Creator'],
        buttons:['Start', 'Pause', 'Reset'],
    })

    const cubes=useRef();
    const mesh=useRef();
    const controlPanel=useRef();
    const group=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
        count:2,
    })

    useEffect(()=>{

        createNew(size);
        
        setTimeout(()=>{
            setAnimation(true)        
        },[2000])

        return () => {
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current,renderer)
        }
    },[])

    function createNew(newSize){
        console.log(newSize)
        let newGridcells={};
        let rows=newSize[0];
        let cols=newSize[1];
        let index=0;
        newGridcells=createNewCube(newSize[0]);
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[2+'.'+3]
        setGridCells(newGridcells)
    }
    
      useFrame(()=>{
        if(animation){
            let blocks=mesh.current.children
            let speed=5
            let ready = updateCubeAnimation(blocks,speed)
            if(ready) setAnimation(false)
        }

        if(start && !pause){
            let {current,stack,count}=savedData.current
            let currentCubes={...cubes.current}
            current.visited=true
            current.current=false;
            current.material.color.set( 'red' )
            let next = current.getNextNeigbor(current,currentCubes);

            let target=rotateToCurrentSide(group,current)

            if(target){
                setSideRotation({ rotation: [target.x-0.5,target.y-0.9,target.z] });
            }

            if (next) {
                let list=controlPanel.current.children[2].children;
                
                savedData.current.count+=1   
                next.material.color.set( 'purple' )
                list[0].children[0].text=count+' / '+Object.keys(gridCells).length+'  ('+((count/Object.keys(gridCells).length)*100).toFixed(1)+'%)'
                list[0].children[1].text='Creating Maze...'
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current.setWalls(current);
                next.setWalls(next);
                savedData.current.current=next
                next.current=true;
                cubes.current=currentCubes
              } 
            else if (stack.length > 0) {
                savedData.current.current=stack.pop();              
            }else{  
                controlPanel.current.children[2].children[0].children[1].text='Maze Ready!'
                setStart(false)
            }       
        }     
    })

    function resetCube(){
        Object.keys(cubes.current).forEach(cube=>{
            cubes.current[cube].material.color.set( 'white' )
            cubes.current[cube].visited=false
            cubes.current[cube].walls=[true,true,true,true]
            cubes.current[cube].setWalls(cubes.current[cube])
        })
        savedData.current={
            current:null,
            stack:[],
            count:2,
        }
        savedData.current.current=cubes.current[2+'.'+3];
    }

    function buttonClick(action){
        if(action==='Start'){
            setStart(true)
            setPause(false)
        }
        if(action==='Pause'){
            setPause(!pause)
        }
        if(action==='Reset'){
            resetCube();
            setStart(false)
            setPause(false)
        }
    }

    function updateSliderValue(newValue){
        if(newValue!==size[0]){
            console.log(newValue)
            resetCube()
            createNew([newValue,newValue])
            setSize([newValue,newValue])
            setAnimation(true);
        }
    }

    return (
        <>
            <animated.group
                {...sideRotation}
                ref={group}
                position={calculateGroupPosition(size,position)}
            >
                <mesh
                ref={mesh}
                position={calculateCubePosition(size,position)}
                >
                    {Object.keys(gridCells).map((elem,index)=>
                        <primitive 
                            object={gridCells[elem].mesh}  
                        />
                    )}
                </mesh>
            </animated.group>
            <group
                position={[-100,0,-20]}
                ref={controlPanel}
            >
                <ControlPanel 
                    controlPanelOptions={controlPanelOptions}
                    renderer={renderer}
                    buttonClick={buttonClick}
                    updateSliderValue={updateSliderValue}
                />
            </group>
            </>
    )
}


function removeWalls(a, b) {

    let x = a.x - b.x;
    if (x === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (x === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }
    let y = a.z - b.z;
    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }

  }


