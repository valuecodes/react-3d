import React from 'react'
import { useFrame } from 'react-three-fiber';

export default function Pathfinder(props) {

    const {
        astar,
        setAstar,
        hexaSphere,
        aStarRef,
        pathLine,
        options
    } = props

    useFrame(()=>{

            if(astar){
                let {
                    openSet,
                    closedSet,
                    path,
                    noSolution,
                    end,
                }=aStarRef.current;
    
                if(openSet.length >0){
    
                    var winner=0;
    
                    for(var d=0;d<openSet.length;d++){
                        if(openSet[d].f<openSet[winner].f){
                            winner=d;
                        }
                    }
    
                    var currentTile = openSet[winner];
    
                    currentTile.setColor(13)
                    if(openSet[winner]===end){
                        for(var s=0;s<path.length;s++){
                            path[s].setColor(16)
                        }   
                        setAstar(false)
                        console.log('Done!')
                        // aStarRef.current.path=calculatePath(currentTile);
                    }
    
                    // for(var i=0;i<tiles.length;i++){
                    //     tiles[i].setColor(1)
                    // }
            
    
                    removeFromArray(openSet,currentTile)
                    closedSet.push(currentTile);
            
                    let neighbors=currentTile.neighbors;
                    neighbors=neighbors.filter(neighbor => !neighbor.obstacle)

                    for(var i=0;i<neighbors.length;i++){
                        var neighbor=neighbors[i];
                        if(!neighbor){
                            console.log('neigbor not found!')
                            continue
                        }
    
                        if(!closedSet.includes(neighbor)){
                            var tempG=currentTile.g+1;
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
                                neighbor.previous=currentTile                   
                            }
    
                        }
                        neighbor.g=currentTile.g+1;
    
                    }
       
                    }else{
    
                        for(var i=0;i<path.length;i++){
                            path[i].setColor(16)
                        }   
                        noSolution=true;
                        console.log('No solution')
                        setAstar(false)
                    }
    
                    
                    for(var q=0;q<closedSet.length;q++){
                        closedSet[q].setColor(15)
                    }
    
                    for(var z=0;z<openSet.length;z++){
                        openSet[z].setColor(14)
                    }
            
    
                    if(!noSolution){
                        path=calculatePath(currentTile);
                    }
    
                    for(var i=0;i<path.length;i++){
                        path[i].setColor(16)
                    }   

                    addPathLine(path,pathLine,options) 

                    aStarRef.current.path=path
                    hexaSphere.mesh.geometry.elementsNeedUpdate = true;
            }
    
        })
    return false
}

export function addPathLine(path, pathLine,options,openFormation=false){
    
    let coordinates = path.map(tile =>
        tile.center
    )
    pathLine.current.geometry.setFromPoints(coordinates.flat())
}

export function calculatePath(currentCell){
    let path=[];
    var temp=currentCell;
    path.push(temp)
    if(temp){
        while(temp.previous){
            path.push(temp.previous)
            temp=temp.previous
        }                           
    }
    return path
}

export function heuristic(a,b){
    return a.center.distanceTo(b.center)
}


export function removeFromArray(arr,elt){
    for(var i=arr.length-1;i>=0;i--){
        if(arr[i].id===elt.id){
            arr.splice(i,1);
        }
    }
}