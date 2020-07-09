import React from 'react'
import { useFrame } from 'react-three-fiber';

export default function Maze(props) {

    const {
        maze,
        setMaze,
        savedData,
        hexaSphere
    } = props
    
    useFrame(()=>{
 
        if(maze){
            
            let {current,stack,count}=savedData.current
            let tiles=hexaSphere.allTiles
            let currentTile=tiles[current]
            currentTile.visited=true
            currentTile.setColor(12)
            let next=currentTile.getNextNeighbor(tiles)
            // console.log(stack.length)
            if(next){

                tiles[next].setColor(13)
                stack.push(currentTile);
                removeWallsBetween(current, next, hexaSphere);

                savedData.current={
                    current:next,
                    stack,
                    count
                }    
                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
                hexaSphere.walls.geometry.elementsNeedUpdate = true;                

            }else if(stack.length > 0){

                let next=stack.pop().id;

                savedData.current={
                    current:next,
                    stack,
                    count
                }   

            }else{
                hexaSphere.walls.geometry.elementsNeedUpdate = true;   
                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
                setMaze(false)
            }
        }
    })
    
    return null
}

function removeWallsBetween(a, b,hexaSphere) {
    let first=hexaSphere.allTiles[a]
    let second=hexaSphere.allTiles[b]

    let aFaces=first.wallFaces
    let bFaces=second.wallFaces
    let faces=hexaSphere.walls.geometry.faces;
    let distanceToNext=first.distanceToNext

    let aClosest;
    let bClosest;

    for(var i=0;i<aFaces.length;i++){
        let distance=faces[aFaces[i][0]].position.distanceTo(second.center)
        if(distance<distanceToNext*0.7){
            aClosest=i
        }
    }

    for(var i=0;i<bFaces.length;i++){
        let distance=faces[bFaces[i][0]].position.distanceTo(first.center)
        if(distance<distanceToNext*0.7){
            bClosest=i
        }
    }

    first.removeWall(aClosest)
    second.removeWall(bClosest)
    first.availableNeighbors.push(second)
    second.availableNeighbors.push(first)

  }