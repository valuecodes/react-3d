import React,{ useState, useEffect, useRef } from 'react'
import Cell from './cell'
// import Tracker from './tracker'
// import Astar from './astar'
// import Maze from './maze'
import { calculatePosition, calculateTextHeaderPosition, calculateListPosition }from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/text/header/headerText'
import TextList from './../../../../../utils/helpers/text/list/textList'

import Algoritm from './algorithm'
import Tracker from './tracker'

export default function Astar({ size, position }) {
    
    const [gridCells, setGridCells] = useState([]);
    const [pathCoordinates, setPathCoordinates]=useState([]);
    const [phase, setPhase] = useState(null)
    const [text, setText] =useState('');
    const [list, setList] = useState(['Pathfinder','Path tracker'])
    const [listMesh, setListMesh]=useState(null);
    
    const mesh=useRef();
    const cubes=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
        count:1
    })

    useEffect(()=>{
        let newGridcells=[];
        let rows=size[0];
        let cols=size[1];
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let gridCell=new Cell(j,i,i*j,rows,cols)
                gridCell.mesh.position.x=(j*2)
                gridCell.mesh.position.z=(i*2)
                newGridcells.push(gridCell)
            }
        }
        newGridcells.forEach(cell => cell.addNeigbors(newGridcells))
        newGridcells.forEach((cell,index) => {
            if(Math.random(1)<0.1){
                cell.addWall(newGridcells)
                cell.addMiddleWall(newGridcells,index)
                if(newGridcells[index+1])newGridcells[index+1].addWall(newGridcells)
                if(newGridcells[index+2])newGridcells[index+2].addWall(newGridcells)
                
            }
        })
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0];
        newGridcells[newGridcells.length-1].wall=false;
        setGridCells(newGridcells)
    },[])

    function startMazeCreator(){
        setPhase('pathFinding')
    }

    function startPathFinding(){
        setPhase('pathFinding')
    }
    
    function startTracking(path){
        setPathCoordinates(path)
        setPhase('trackPath')
    }

    function addListMesh(mesh){
        setListMesh(mesh)
    }

    return (
        <mesh
            ref={mesh}
            position={calculatePosition(size,position,2)}
            onClick={e => startMazeCreator()}
        >
            <Algoritm 
                gridCells={gridCells}
                phase={phase}
                cubes={cubes}
                listMesh={listMesh}
                startTracking={startTracking}
                />
            <Tracker 
                mesh={mesh}
                listMesh={listMesh}
                phase={phase}
                pathCoordinates={pathCoordinates}
            />

            <HeaderText 
                text={'Maze Pathfinder'}
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
