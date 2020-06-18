import React,{ useEffect, useState, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import CellObject from './objects/cell'
import Cell from './cell'

export default function Maze() {
    
    const [grid, setGrid]=useState([]);
    const [start, setStart]=useState(false)
    let savedData=useRef({
        current:null,
        stack:[]
    })

    useEffect(()=>{
        let newGrid=[];
        let rows=40;
        let cols=40;
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                newGrid.push(new CellObject(j,i))
            }
        }
        savedData.current.current=newGrid[0]
        setGrid(newGrid)
    },[])    

    useFrame(()=>{
        if(start){

            let {current,stack}=savedData.current
            let newGrid=[...grid]
            current.visited=true
            current.current=false;
            let next = current.checkNeigbors(grid);
            if (next) {
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                savedData.current.current=next
                next.current=true;
                setGrid(newGrid);
              } 
            else if (stack.length > 0) {
                savedData.current.current=stack.pop();              
            }else{
                setStart(false)
            }          
        }

        
    })

    return (
        <mesh 
            onClick={e => setStart(!start)}
            position={[-50,0,-50]}
        >
           {grid.map(cell=>
                <Cell cell={cell} />
            )}             
        </mesh>
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