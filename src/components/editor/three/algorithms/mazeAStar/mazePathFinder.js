import React,{ useState, useEffect, useRef } from 'react'
import Cell from './cell'
import Tracker from './tracker'
import Astar from './astar'
import Maze from './maze'

export default function MazePathFinder({size}) {
    
    const [gridCells, setGridCells] = useState([]);
    const [mazeCreator, setMazeCreator] = useState(false);
    const [pathFinding, setPathFinding] = useState(false);
    const [trackPath, setTrackPath]=useState(false);
    const [pathCoordinates, setPathCoordinates]=useState([]);
    
    const mesh=useRef();
    const cubes=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
    })

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

    function startPathFinding(){
        setMazeCreator(false)
        setPathFinding(true) 
    }
    
    function startTracking(path){
        setPathCoordinates(path)
        setTrackPath(true);
    }

    return (
        <mesh
            ref={mesh}
            position={[size[0]*-2.5,0,size[1]*-2.5]}
            onClick={e => setMazeCreator(!mazeCreator)}
        >
            <Maze 
                gridCells={gridCells} 
                mazeCreator={mazeCreator} 
                savedData={savedData} 
                cubes={cubes} 
                startPathFinding={startPathFinding}
            />
            <Astar 
                pathFinding={pathFinding} 
                cubes={cubes} 
                startTracking={startTracking}
            />
            <Tracker 
                trackPath={trackPath} 
                pathCoordinates={pathCoordinates}
            />
        </mesh>
    )
}
