import React,{ useRef, useState, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import { Vector3 } from 'three';

export default function Astar({pathFinding, cubes, startTracking}) {
    const line=useRef();
    const [aStart, setaStart]=useState(false);

    let savedAstar=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    useEffect(()=>{
        if(pathFinding){
            startAstar()
        }
    },[pathFinding])
    
    function startAstar(){
        savedAstar.current={
            openSet:[cubes.current[0]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:cubes.current[0],
            end:cubes.current[Object.keys(cubes.current).length-1],
            currentPosition:[0,0,0],
            currentTarget:null
        }  
        setaStart(true)
    }

    useFrame(()=>{
        if(aStart){
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

            let notFound=true;
            let ending=false

            if(openSet.length >0){
                var winner=0;
                for(var i=0;i<openSet.length;i++){
                    if(openSet[i].f<openSet[winner].f){
                        winner=i;
                    }
                }
                var current = openSet[winner];
                current.material.color.set( 'purple' ) 
                if(openSet[winner]===end){
                    console.log('Done!')
                    addLine(line,path)
                    setaStart(false)
                    ending=true;
                }

                removeFromArray(openSet,current)
                closedSet.push(current);
                
                let neighbors=current.neighbors;

                let availableNeighbors= neighbors.filter(neighbor => checkWall(neighbor,current))

                for(var i=0;i<availableNeighbors.length;i++){
                    var neighbor=availableNeighbors[i];

                    if(!closedSet.includes(neighbor)){
                        var tempG=current.g+1;

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
                            neighbor.previous=current                    
                        }
                    }
                    neighbor.g=current.g+1;
                }
        
            }else{
                notFound=false
                noSolution=true;
                setaStart(false)
            }
            
            for(var q=0;q<closedSet.length;q++){
                closedSet[q].material.color.set( 'salmon' )             
            }
            
            for(var z=0;z<openSet.length;z++){
                openSet[z].material.color.set('seagreen')
            }
        
            if(!noSolution){
                path=[];
                var temp=current;
                path.push(temp)
                while(temp.previous){     
                    path.push(temp.previous)
                    temp=temp.previous
                }        
            }

            for(var i=0;i<path.length;i++){

                path[i].material.color.set('white')
            }                
            
            addLine(line,path)
            
            savedAstar.current={
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentPosition,
                currentTarget                
            } 
            if(ending){
                startTracking(savedAstar.current); 
            }
        }
    })
 
    return (
        <line
            ref={line}
        >
            <bufferGeometry attach="geometry"/>
            <lineBasicMaterial attach="material" color={'red'}/>
        </line>
    )
}

function addLine(line, path){
    let coordinates = path.map(cor => new Vector3(cor.x*5, 1, cor.z*5))
    line.current.geometry.setFromPoints(coordinates)
}

function checkWall(neighbor, current){
    let pos;
    if(neighbor.z===current.z){
        if(neighbor.x>current.x){
            pos=1
        }else{
            pos=3
        }        
    }
    if(neighbor.x===current.x){
        if(neighbor.z<current.z){
            pos=0
        }else{
            pos=2
        }
    }
    return !current.walls[pos];
}    

function removeFromArray(arr,elt){
    for(var i=arr.length-1;i>=0;i--){
        if(arr[i]==elt){
            arr.splice(i,1);
        }
    }
}
    
function heuristic(a,b){
    return Math.sqrt( Math.pow((a.i-b.i), 2) + Math.pow((a.j-b.j), 2) );
    // return Math.abs(a.i-b.i)+Math.abs(a.j-b.j)
}