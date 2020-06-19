import React,{ useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from 'react-three-fiber'
import CellObject from './objects/cell'
import { Vector3 } from 'three';
import GridCell from './gridCell'

export default function GridRef() {
    const [grid, setGrid] = useState([]);
    const [gridCells, setGridCells] = useState([]);
    const [start, setStart]=useState(false)
    const cubes=useRef();
    let savedData=useRef({
        current:null,
        stack:[]
    })

    useEffect(()=>{
        let newGridcells=[];
        let rows=20;
        let cols=20;
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let gridCell=new GridCell(j,i,i*j)
                gridCell.mesh.position.x=(j*5)
                gridCell.mesh.position.z=(i*5)
                gridCell.createWalls()
                newGridcells.push(gridCell)
            }
        }
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0]
        setGridCells(newGridcells)
    },[])

    useFrame(()=>{
        if(start){
            
            let {current,stack}=savedData.current
            let currentCubes={...cubes.current}
            // console.log(current,stack,currentCubes)
            // let newGrid=[...grid]
            current.visited=true
            current.current=false;
            current.material.color.set( 'red' )
            // currentCubes[current.index].mesh.material.color.g=0
            let next = current.checkNeigbors(currentCubes);
            if (next) {
                next.material.color.set( 'purple' )
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current.setWalls(current);
                next.setWalls(next);
                savedData.current.current=next
                next.current=true;
                cubes.current=currentCubes
                
                // console.log(stack)
                // currentCubes[next.index].mesh.material.color.g=250
                // currentCubes[next.index].mesh.material.color.r=250
                // setGrid(newGrid);
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
        position={[-50,0,-50]}
        onClick={e => setStart(!start)}
        >
            {gridCells.map(elem=>
                <primitive object={elem.mesh}/>
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