import React,{ useState, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'

export default function Maze(props) {

    const {
        mesh,
        phase,
        gridCells, 
        savedData,
        cubes,
        startPathFinding
    } = props

    const [maze, setMaze]=useState(false)

    useEffect(()=>{
        setMaze(phase==='mazeCreator')
    },[phase])

    useFrame(()=>{
        if(maze){
            let {current,stack,count}=savedData.current
            let currentCubes={...cubes.current}
            current.visited=true
            current.current=false;
            current.material.color.set( 'gray' )
            let next = current.getNextNeighbor();
            if (next) {
                savedData.current.count+=1           
                mesh.current.children[mesh.current.children.length-1].text='Creating Maze...'+((count/Object.keys(gridCells).length)*100).toFixed(1)+'%'

                console.log(mesh.current.children[mesh.current.children.length-1].geometry.instanceCount)
                next.material.color.set( 'purple' )
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
                startPathFinding();
            }          
        }
    })

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
    
    return (
        <>
            {gridCells.map(elem=>
                <primitive object={elem.mesh}/>
            )}
        </>
    )
}