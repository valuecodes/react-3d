import React,{ useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from 'react-three-fiber'
import { Vector3 } from 'three';
import GridCell from './gridCell'
import { calculatePosition, calculateTextHeaderPosition, calculateListPosition}from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/text/header/headerText'
import TextList from './../../../../../utils/helpers/text/list/textList'


export default function GridRef({size, position}) {
    const [grid, setGrid] = useState([]);
    const [gridCells, setGridCells] = useState([]);
    const [start, setStart]=useState(false)
    const [list, setList]=useState(['Click on the grid to start'])
    const [listMesh, setListMesh]=useState(null);
    const cubes=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
        count:1,
    })

    useEffect(()=>{
        let newGridcells=[];
        let rows=size[0];
        let cols=size[1];
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let gridCell=new GridCell(j,i,i*j,rows,cols)
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
            let {current,stack,count}=savedData.current
            let currentCubes={...cubes.current}
            current.visited=true
            current.current=false;
            current.material.color.set( 'red' )
            let next = current.checkNeigbors(currentCubes);
            if (next) {
                
                savedData.current.count+=1   
                listMesh[0].text='Creating Maze...'+((count/Object.keys(gridCells).length)*100).toFixed(1)+'%'

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
                listMesh[0].text='Maze Ready'
                setStart(false)
            }          
        }     
    })

    function addListMesh(mesh){
        setListMesh(mesh)
    }
    
    return (
        <mesh
        position={calculatePosition(size,position)}
        onClick={e => setStart(!start)}
        >
            {gridCells.map(elem=>
                <primitive object={elem.mesh}/>
            )}

            <HeaderText 
                text={'Maze'}
                phase={true}
                position={calculateTextHeaderPosition(size,position)}    
            />
            <TextList
                list={list}
                listMesh={listMesh}
                addListMesh={addListMesh}
                text={'test'}
                size={size}
                position={calculateListPosition(size,position,0)} 
            />  
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