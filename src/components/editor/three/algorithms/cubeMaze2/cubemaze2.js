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
// let rotation = [0, 0, 0];

export default function CubeMaze2(props) {

    const {
        position,
        renderer,
        cameraSettings
    } = props

    const [sideRotation, setSideRotation] = useSpring(() => ({
        rotation: [...rotation],
        config: { mass: 5, friction: 40, tension: 400 },
      }))

    const [cubeCells, setCubeCells] = useState([]);
    const [start, setStart]=useState(false)
    const [pause, setPause]=useState(false)
    const [ready, setReady]=useState(false)
    const [currentPos, setCurrentPos]=useState([])
    const [cubeSize, setCubeSize]=useState(null);
    const [animation, setAnimation]=useState(false)
    const [size, setSize]=useState([10,10])
    const [sides, setSides]=useState([]);

    const [controlPanelOptions, setControlPanelOptions]=useState({
        list:['Maze Creator'],
        buttons:['Start', 'Pause', 'Reset'],
        options:['Show frame','Open Cube','Hide Walls']
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

        createNew(size)
    
        setTimeout(()=>{
            setAnimation(true)        
        },[2000])
        return () => {
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current,renderer)
        }
    },[])
    
    function createNew(newSize){
        let newCubeCells = createNewCube(size[0]);
        cubes.current=newCubeCells[0];
        savedData.current.current=newCubeCells[0][0+'.'+0+'.'+0]  
        setCubeCells(newCubeCells[0]) 
        setSides(newCubeCells[1])
    }
    
      useFrame(()=>{

        if(animation){
            let blocks=cubes.current
            let speed=1*(size[0]/10)
            let rotationSpeed=0.1*(size[0]/10)
            let ready = updateCubeAnimation(blocks,speed,rotationSpeed)
            if(ready) setAnimation(false)
        }

        if(ready){
            // group.current.rotation.x-=0.003
            // group.current.rotation.y-=0.002
            // group.current.rotation.z+=0.003
        }

        if(start && !pause){
            let {current,stack,count}=savedData.current
            let currentCubes=cubes.current
            current.visited=true
            current.current=false;
            current.material.color.set( 'red' )
            let next = current.getNextNeigbor(current,currentCubes,sides);

            let target=rotateToCurrentSide(group,current)
            if(target){
                setSideRotation({ rotation: [target.x-0.5,target.y-0.9,target.z] });
            }

            if (next) {
                let list=controlPanel.current.children[2].children;
                
                savedData.current.count+=1   
                next.material.color.set( 'purple' )
                list[0].children[0].text=count+' / '+Object.keys(cubeCells).length+'  ('+((count/Object.keys(cubeCells).length)*100).toFixed(1)+'%)'
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
                setReady(true)
            }       
        }     
    })

    function resetCube(){

        Object.keys(cubes.current).forEach(cube=>{
            cubes.current[cube].material.color.set( 'green' )
            cubes.current[cube].visited=false
            cubes.current[cube].walls=[true,true,true,true]
            cubes.current[cube].setWalls(cubes.current[cube])
            
        })

        for(var i=0;i<sides.length;i++){
            let keys=Object.keys(sides[i].sideEdges)
            for(var a=0;a<keys.length;a++){
                sides[i].sideEdges[keys[a]].addEdgeNeigbors(sides[i].sideEdges[keys[a]],cubes.current,sides)
            }
        } 

        savedData.current={
            current:null,
            stack:[],
            count:2,
        }

        savedData.current.current=cubes.current[0+'.'+0+'.'+0]
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
            setReady(false)
        }
    }

    function updateSliderValue(newValue){
        if(newValue!==size[0]){
            console.log(newValue)
            // resetCube()
            // createNew([newValue,newValue])
            // setSize([newValue,newValue])
            // setAnimation(true);
        }
    }

    function selectOption(option){
        console.log(option)
        if(option==='Show frame'){
            {Object.keys(cubeCells).forEach((elem,index)=>
                cubeCells[elem].mesh.material.visible=false
            )}
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
                {Object.keys(cubeCells).map((elem,index)=>
                    <primitive 
                        object={cubeCells[elem].mesh}  
                        onClick={e => console.log(cubeCells[elem])}
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
                    selectOption={selectOption}
                    cubes={cubes}
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
    let y = a.y - b.y;
    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }

  }