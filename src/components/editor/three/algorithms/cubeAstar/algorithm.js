import React, { useState, useRef, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import { 
    rotateToCurrentSide,
    calculatePathPosition
}from './../../../../../utils/other/calculatePosition'
import { useSpring, animated, useTrail } from 'react-spring/three'

let rotation = [0, 0, 0];
export default function Algorithm(props) {

    const [aStar, setaStar]=useState(false);
    const [sideRotation, setSideRotation] = useSpring(() => ({
        rotation: [...rotation],
        config: { mass: 5, friction: 40, tension: 400 },
      }))
    const {
        cubeCells,
        start,
        pause,
        cubes,
        savedData,
        group,
        updateSideRotation,
        sides,
        size,
        cellSize
    } = props
    const line=useRef()
    let savedAstar=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    useEffect(()=>{
        if(start){
            startAstar()
        }
    },[start])

    function startAstar(){

        let end=5+'.'+10+'.'+10

        savedAstar.current={
            openSet:[cubes.current[0+'.'+5+'.'+5]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:cubes.current[0+'.'+2+'.'+2],
            end:cubes.current[end],
            currentPosition:[0,0,0],
            currentTarget:null
        }  

        cubes.current[end].wall=false

        setaStar(true)
    }

    function removeFromArray(arr,elt){
        for(var i=arr.length-1;i>=0;i--){
            if(arr[i]==elt){
                arr.splice(i,1);
            }
        }
    }
    
    function heuristic(a,b){
        return calcuteDistance(a.cubePosition,b.cubePosition)
    }


    function calcuteDistance(current, target){
        let distance=
        Math.abs(current.x-target.x)+
        Math.abs(current.y-target.y)+
        Math.abs(current.z-target.z) 
        return distance
    }

    useFrame(() => { 

        

        if(aStar && !pause){
            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentPosition,
                currentTarget
            }=savedAstar.current;

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
                    setaStar(false)
                    ending=true;
                    // listMesh[1].text='Path Found!'
                    // listMesh[1].children[0].material.color.set('black')
                }
        
                let target=rotateToCurrentSide(group,currentCell)
                if(target){
                    updateSideRotation(target);
                    setSideRotation({ rotation: [target.x-0.5,target.y-0.9,target.z] });
                }
         

                removeFromArray(openSet,currentCell)
                closedSet.push(currentCell);
        
                let neighbors=currentCell.neighbors;

                for(var i=0;i<neighbors.length;i++){
                    var neighbor=cells[neighbors[i]];
      
                    if(!neighbor)continue

                    if(!closedSet.includes(neighbor)&&!neighbor.wall){
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
                    setaStar(false)
                }

                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].material.color.set('yellow')

                }
                
                for(var z=0;z<openSet.length;z++){
                    openSet[z].material.color.set('seagreen')

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
                addLine(path)  

                for(var i=0;i<path.length;i++){
                    path[i].material.color.set('midnightblue')
                    
                }      
        }     
    })

    function addLine(path){
 
        let coordinates = path.map(cor => 
            calculatePathPosition(cor,cellSize)
        )
        line.current.geometry.setFromPoints(coordinates)
    }


    return (
        <>
            {Object.keys(cubeCells).map((elem,index)=>
                <primitive 
                    object={cubeCells[elem].mesh}  
                    onClick={e => console.log(cubeCells[elem])}
                />
            )} 
            <line
                ref={line}
            >
                <bufferGeometry attach="geometry"/>
                <lineBasicMaterial attach="material" color={'red'} side={2}/>
            </line>
        </>
    )
}
