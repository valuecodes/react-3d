import React,{ useState, useEffect, useRef } from 'react'
import Cell from './cell'
import Tracker from './tracker'
import Astar from './astar'
import Maze from './maze'
import { calculatePosition, calculateTextHeaderPosition, calculateListPosition }from './../../../../../utils/other/calculatePosition'
import HeaderText from './../../../../../utils/helpers/headerText'
import TextList from './../../../../../utils/helpers/text/textList'

export default function MazePathFinder({ size, position }) {
    
    const [gridCells, setGridCells] = useState([]);
    const [pathCoordinates, setPathCoordinates]=useState([]);
    const [phase, setPhase] = useState(null)
    const [text, setText] =useState('');
    const [list, setList] = useState(['Maze Creator','Pathfinder','Path tracker'])
    const mesh=useRef();
    const cubes=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
        count:1
    })

    useEffect(()=>{
        console.log()

        let newText='123'
        if(phase==='mazeCreator') newText='Creating Maze'
        if(phase==='pathFinding') newText='Finding Path'
        if(phase==='trackPath') newText='Tracking Path'        
        console.log(mesh)
        if( mesh.current.children[27]){
            // mesh.current.children[27].text=newText
        }
        
        // setText(newText)
    },[phase])

    useEffect(()=>{
        let newGridcells=[];
        let rows=size[0];
        let cols=size[1];
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let gridCell=new Cell(j,i,i*j,rows,cols)
                gridCell.mesh.position.x=(j*5)
                gridCell.mesh.position.z=(i*5)
                gridCell.createWalls()
                newGridcells.push(gridCell)
            }
        }
        newGridcells.forEach(cell => cell.addNeigbors(newGridcells))
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0];
        setGridCells(newGridcells)
    },[])

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

    return (
        <mesh
            ref={mesh}
            position={calculatePosition(size,position)}
            onClick={e => startMazeCreator()}
        >
            <Maze 
                mesh={mesh}
                phase={phase}
                gridCells={gridCells} 
                savedData={savedData} 
                cubes={cubes} 
                startPathFinding={startPathFinding}
            />
            <Astar 
                mesh={mesh}
                phase={phase}
                cubes={cubes} 
                startTracking={startTracking}
            />
            <Tracker 
                mesh={mesh}
                phase={phase}
                pathCoordinates={pathCoordinates}
            />

            <HeaderText 
                text={'Maze Pathfinder'}
                phase={true}
                position={calculateTextHeaderPosition(size,position)}    
            />
            {list.map((elem,index)=>
                <TextList
                    text={elem}
                    phase={true}
                    position={calculateListPosition(size,position,index)} 
                />            
            )}

        </mesh>
    )
}
