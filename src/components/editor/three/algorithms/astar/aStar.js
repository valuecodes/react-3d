import React,{ useState, useEffect, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import { 
    calculatePosition, 
    calculateTextHeaderPosition, 
    calculateListPosition,
    updateAnimation
}from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/text/header/headerText'
import TextList from './../../../../../utils/helpers/text/list/textList'
import { disposeElements } from './../../../../../utils/other/disposeElements'
import Cell from './cell'
import Algoritm from './algorithm'
import Tracker from './tracker'

export default function Astar({ size, position, renderer }) {
    
    const [gridCells, setGridCells] = useState([]);
    const [pathCoordinates, setPathCoordinates]=useState([]);
    const [phase, setPhase] = useState(null)
    const [text, setText] =useState('');
    const [list, setList] = useState(['Pathfinder','Path tracker'])
    const [listMesh, setListMesh]=useState(null);
    const [animation, setAnimation]=useState(false)
    
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
                let target=[j*5,i*5]
                gridCell.mesh.target=target
                newGridcells.push(gridCell)
            }
        }
        newGridcells.forEach(cell => cell.addNeigbors(newGridcells))
        newGridcells.forEach((cell,index) => {
            if(Math.random(1)<0.05){
                cell.addWall(newGridcells)
                // cell.addMiddleWall(newGridcells,index)
                if(newGridcells[index+1])newGridcells[index+1].addWall(newGridcells)
                if(newGridcells[index+2])newGridcells[index+2].addWall(newGridcells)
                
            }

            if(Math.random(1)<0.05){
                cell.addWall(newGridcells)
                if(newGridcells[index+rows]) newGridcells[index+rows].addWall(newGridcells)
                if(newGridcells[index+(rows*2)]) newGridcells[index+(rows*2)].addWall(newGridcells)
                
            }
        })
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0];
        // newGridcells[newGridcells.length-1].wall=false;
        setGridCells(newGridcells)

        setTimeout(()=>{
            setAnimation(true)
        },[1000])

        return () => disposeElements(mesh.current, renderer)
    },[])

    useFrame(()=>{
        if(animation){
            let blocks=mesh.current.children
            let speed=2.5
            let ready = updateAnimation(blocks,speed)
            if(ready) setAnimation(false)             
        }
    })

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
            position={calculatePosition(size,position,5)}
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
                renderer={renderer}
            />

            <HeaderText 
                text={'Maze Pathfinder'}
                phase={true}
                position={calculateTextHeaderPosition(size,position)} 
                renderer={renderer}   
            />
            <TextList
                list={list}
                listMesh={listMesh}
                addListMesh={addListMesh}
                text={'test'}
                size={size}
                position={calculateListPosition(size,position,0)}
                renderer={renderer} 
            />   
        </mesh>
    )
}
