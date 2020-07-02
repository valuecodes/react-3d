import React,{ useState, useEffect, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import { 
    getRandomCell,
    getFirstCell,
    rotateToCurrentSide,
}from './../../../../../utils/other/calculatePosition'
import{
    removeFromArray,
    heuristic,
    calcuteDistance,
    addPathLine,
    calculatePath
} from './../shapes/calculations'

export default function Pathfinder(props) {

    const{
        cubes,
        options,
        pathLine,
        aStarRef,
        state,
        setState,
        automaticRotation,
    } = props
    const newState={...state}
    const{
        aStar,
        tracking
    } = state

    const [start, setStart] = useState(false)
    let colorScheme=options.colorScheme

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
            currentTarget:null
        }  

        end.wall=false

        setStart(true)
    }

    useFrame(() => { 

        if(start){
            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
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
                currentCell.mesh.material.color.set(colorScheme.current)
                if(openSet[winner]===end){
                    console.log('Done!')
                    aStarRef.current.path=calculatePath(currentCell);
                    setStart(false)
                    newState.aStar=false
                    newState.tracking=true
                    setState(newState)
                    ending=true;
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
                    
                    if(!neighbor){
                        console.log('neigbor not found!')
                        continue
                    }

                    if(!closedSet.includes(neighbor)&&!currentCell.walls[i]){
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
                }

                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].mesh.material.color.set(colorScheme.closedSet)
                }
                
                for(var z=0;z<openSet.length;z++){
                    openSet[z].mesh.material.color.set(colorScheme.openSet)
                }
            
                if(!noSolution){
                    path=calculatePath(currentCell);
                }
                addPathLine(path,pathLine,options)  

                for(var i=0;i<path.length;i++){
                    path[i].mesh.material.color.set(colorScheme.path)
                }      
        }     
    })

    return (
        <>

        </>
    )
}
