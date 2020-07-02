import React,{ useState, useEffect, useRef } from 'react'
import Cell from './cell'
import Tracker from './tracker'
import Astar from './astar'
import Maze from './maze'
import Tracker from './tracker'
import { useFrame } from 'react-three-fiber'
import { 
    calculatePosition, 
    calculateTextHeaderPosition, 
    calculateListPosition, 
    updateAnimation,
}from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/text/header/headerText'
import TextList from './../../../../../utils/helpers/text/list/textList'
import { disposeElements } from './../../../../../utils/other/disposeElements'


export default function MazePathFinder({ size, position, renderer }) {
    
    const [gridCells, setGridCells] = useState([]);
    const [pathCoordinates, setPathCoordinates]=useState([]);
    const [phase, setPhase] = useState(null)
    const [text, setText] =useState('');
    const [list, setList] = useState(['Maze Creator','Pathfinder','Path tracker'])
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
                let target=[j*5,i*5]
                let gridCell=new Cell(j,i,i*j,rows,cols)
                gridCell.mesh.target=target
                gridCell.createWalls()
                newGridcells.push(gridCell)
            }
        }
        newGridcells.forEach(cell => cell.addNeigbors(newGridcells))
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0];
        setGridCells(newGridcells)
        setTimeout(()=>{
            setAnimation(true)
        },[1000])

        return () => {
            mesh.current.children.forEach(elem => disposeElements(elem,renderer))
            disposeElements(mesh.current,renderer)
        }
    },[])

    useFrame(()=>{
        if(animation&&mesh.current){
            let blocks=mesh.current.children
            let speed=5
            let ready = updateAnimation(blocks,speed)
            if(ready) setAnimation(false)             
        }
    })

    function startMazeCreator(){
        setPhase('mazeCreator')
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
            position={calculatePosition(size,position)}
            onClick={e => startMazeCreator()}
        >
            <Maze 
                mesh={mesh}
                listMesh={listMesh}
                phase={phase}
                gridCells={gridCells} 
                savedData={savedData} 
                cubes={cubes} 
                startPathFinding={startPathFinding}
            />
            <Astar 
                mesh={mesh}
                listMesh={listMesh}
                phase={phase}
                cubes={cubes} 
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
