import React, { useState, useRef, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import { 
    rotateToCurrentSide,
    calculatePathPosition,
    getRandomCell,
    updateCubeAnimation,
    getFirstCell
}from './../../../../../utils/other/calculatePosition'

import{
    removeFromArray,
    heuristic,
    calcuteDistance,
    addPathLine,
    calculatePath
} from './../shapes/calculations'

import { useSpring, animated, useTrail } from 'react-spring/three'
import { findAllByTestId } from '@testing-library/dom';

let rotation = [0, 0, 0];
export default function Algorithm(props) {

    const [start, setStart]=useState(false);
    const [sideRotation, setSideRotation] = useSpring(() => ({
        rotation: [...rotation],
        config: { mass: 5, friction: 40, tension: 400 },
      }))
    const {
        cubes,
        sides,
        options,
        pathLine,
        aStarRef,
        state,
        setState,
        automaticRotation
    } = props

    let {
        pause,
        maze,
        animation,
        aStar,
        ready,
        tracking
    } = state
    let newState={...state}

    useEffect(()=>{
        if(aStar){
            startAstar()
        }
    },[aStar])

    function startAstar(){

        let end=getRandomCell(cubes.current)
        let start=getFirstCell(cubes.current)
        end.setEndPoint();
        start.setStartPoint();
        aStarRef.current={
            openSet:[start],
            closedSet:[],
            path:[],
            noSolution:false,
            start:start,
            end:end,
            currentPosition:[0,0,0],
            currentTarget:null
        }  

        end.wall=false

        setStart(true)
    }

    useFrame(() => { 

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
            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentPosition,
                currentTarget
            }=aStarRef.current;

            let cells=cubes.current

            let notFound=true;
            let ending=false

            if(openSet.length >0){
                var winner=0;
                for(var i=0;i<openSet.length;i++){
                    if(openSet[i].f<openSet[winner].f){
                        winner=i;
                    }
                }
                var currentCell = openSet[winner];
                if(openSet[winner]===end){
                    console.log('Done!')
                    aStarRef.current.path=calculatePath(currentCell);
                    setStart(false)
                    newState.aStar=false
                    newState.tracking=true
                    setState(newState)
                    // listMesh[1].text='Path Found!'
                    // listMesh[1].children[0].material.color.set('black')
                }
        
                if(options.automaticRotation){
                    automaticRotation(currentCell)
                }
         

                removeFromArray(openSet,currentCell)
                closedSet.push(currentCell);
                let neighbors=currentCell.neighbors;

                for(var i=0;i<neighbors.length;i++){
                    var neighbor=cells[neighbors[i]];
      
                    if(!neighbor)continue

                    if(!closedSet.includes(neighbor)&&!neighbor.obstacle){
                        var tempG=currentCell.g+1;
                        let newPath=false;
                        if(openSet.includes(neighbor)){
                            if(tempG<neighbor.g){
                                neighbor.g=tempG
                                newPath=true;
                            }
                        }else{
                            neighbor.g=tempG;
                            newPath=true;
                            openSet.push(neighbor);
                        }
                        if(newPath){
                            neighbor.h=heuristic(neighbor,end)
                            neighbor.f=neighbor.g+neighbor.h;  

                            neighbor.previous=currentCell                   
                        }
                    }
                    neighbor.g=currentCell.g+1;
                }
            
                }else{
                    notFound=false
                    noSolution=true;
                    setStart(false)
                    newState.aStar=false
                    setState(newState)
                }

                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].mesh.material.color.set(options.colorScheme.closedSet)

                }
                
                for(var z=0;z<openSet.length;z++){
                    openSet[z].mesh.material.color.set(options.colorScheme.openSet)

                }
            
                if(!noSolution){
                    path=[];

                    var temp=currentCell;

                    path.push(temp)
                    if(temp){
                        while(temp.previous){
                            path.push(temp.previous)
                            temp=temp.previous
                        }                           
                    }
     
                }

                addPathLine(path,pathLine,options)

                for(var i=0;i<path.length;i++){
                    path[i].mesh.material.color.set(options.colorScheme.path)
                    
                }      
        }     
    })

    return (
        <>
        </>
    )
}
