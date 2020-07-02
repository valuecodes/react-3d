import React, {useEffect,useRef,useState} from 'react'
import { useFrame } from 'react-three-fiber'
import {  
    rotateToCurrentSide,
    updateCubeAnimation,
    getFirstCell,
}from './../../../../../utils/other/calculatePosition'
import {
    setWallsVisible
} from './../shapes/calculations'

export default function MazeCreator(props) {

    const {
        cubes,
        group,
        sides,
        controlPanel,
        setSideRotation,
        options,
        state,
        setState,
        automaticRotation,
    } = props

    let {
        pause,
        maze,
        animation,
        aStar,
        ready
    } = state

    let newState={...state}

    let colorScheme=options.colorScheme

    const [start, setStart] = useState(false)

    useEffect(()=>{
        if(maze) startMazeCreator()
    },[maze])

    let savedData=useRef({
        current:null,
        stack:[],
        count:2,
    })

    function startMazeCreator(){
        savedData.current.current=getFirstCell(cubes.current)
        setStart(true)
    }

    useFrame(()=>{

        if(animation){
            let blocks=cubes.current
            let speed=1*(options.size/10)
            let rotationSpeed=0.1*(options.size/10)
            let ready = updateCubeAnimation(blocks,speed,rotationSpeed)
            
            if(ready){
                newState.animation=false
                setState(newState)
            }
        }

        if(start && !pause){
            let {current,stack,count}=savedData.current
            let currentCubes=cubes.current
            
            current.visited=true
            current.current=false;
            current.mesh.material.color.set( colorScheme.current )
            let next = current.getNextNeigbor(current,currentCubes,sides,stack);

            if(options.automaticRotation){
                automaticRotation(current)
            }

            if (next) {

                let list=controlPanel.current.children[2].children;
                savedData.current.count+=1   
                next.mesh.material.color.set( colorScheme.next )
                list[0].children[0].text=count+' / '+Object.keys(currentCubes).length+'  ('+((count/Object.keys(currentCubes).length)*100).toFixed(1)+'%)'
                list[0].children[1].text='Creating Maze...'
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current.setWalls(current)
                next.setWalls(next)
                savedData.current.current=next
                next.current=true;
            } 
            else if (stack.length > 0) {

                let nextBlock=getNextUnvisited(currentCubes,stack)
                savedData.current.current=nextBlock;

                if(!nextBlock) mazeReady(cubes);              
            }else{  
                mazeReady(cubes);                      
            }       
        }     
    })

    function mazeReady(){
        controlPanel.current.children[2].children[0].children[1].text='Maze Ready!'        
        setWallsVisible(cubes)
        setStart(false)
        newState.ready=false;
        newState.aStar=true;
        setState(newState)   
        savedData.current.count=0;
    }

    return null
}

function getNextUnvisited(currentCubes, stack){
    let nextBlock=stack.pop()
    let len=stack.length

    for(var i=0;i<len;i++){

        let found=false;

        if(nextBlock){
            let one=currentCubes[currentCubes[nextBlock.id].neighbors[0]]
            let two=currentCubes[currentCubes[nextBlock.id].neighbors[1]]
            let three=currentCubes[currentCubes[nextBlock.id].neighbors[2]]
            let four=currentCubes[currentCubes[nextBlock.id].neighbors[3]]
            if(one){
                if(!one.visited){
                    found=true
                }
            }
            if(two){
                if(!two.visited){
                    found=true
                }
            }
            if(three){
                if(!three.visited){
                    found=true
                }
            }
            if(four){
                if(!four.visited){
                    found=true
                }
            }

            if(!found){
                nextBlock=stack.pop()
            }
        }      
        if(found){
            return nextBlock
        }              
    }
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