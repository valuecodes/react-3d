import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import MazeAstar from './../shapes/hexasphere/mazeAstar'
import PathLine from './../shapes/hexasphere/pathline'
import download from './../shapes/download'
import mazes from './../shapes/hexasphere/ReadyMazes'
import Rotation from './../shapes/hexasphere/rotation'
import Pathfinder from './../shapes/hexasphere/pathfinder'
import Maze from './../shapes/hexasphere/maze'
import { 
    addObstacles, 
    clearObstacles,
    resetHexasphere 
} from './../shapes/hexasphere/hexasphere'
import {
    addPathLine
} from './../shapes/hexasphere/pathfinder'

export default function HexaSphere({options,modifyOptions}) {

    const [hexaSphere, setHexaSphere]=useState(null);
    
    let savedData=useRef({
        current:0,
        stack:[],
        count:2,
    })

    let aStarRef=useRef({
        currentStart:null,
        currentTarget:null,
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:null
    })

    const group=useRef();
    const pathLine=useRef();
    const [astar, setAstar]=useState(false)
    const [maze, setMaze]=useState(false)
    const [mazeAstar, setMazeAstar]=useState(false)
    const [mouseDown,setMouseDown]=useState(false)
    const [currentAlgo, setCurrentAlgo]=useState(null)

    useEffect(()=>{
        let hexagonSphere = createHexasphere(options.sphere,group)
        group.current.add(hexagonSphere.mesh)
        group.current.add(hexagonSphere.walls)
        setHexaSphere(hexagonSphere)
    },[])

    function addMaze(hexaSphere){
        let tiles=hexaSphere.allTiles
        let detail=options.sphere.detail;

        for(var i=0;i<tiles.length;i++){
            tiles[i].walls=mazes[detail][i][1].map(wall => wall===1?false:true)
            tiles[i].availableNeighbors=mazes[detail][i][0].map(neighbor => tiles[neighbor])
            tiles[i].setWalls()
        }
        hexaSphere.mesh.geometry.elementsNeedUpdate = true;
    }

    useEffect(()=>{
        if(currentAlgo==='Maze Creator'){
            setWallColors(hexaSphere,1)
        }
        if(currentAlgo==='Pathfinder'){
            setWallColors(hexaSphere,0)
        }
        if(currentAlgo==='Maze Pathfinder'){
            setWallColors(hexaSphere,1)
            addMaze(hexaSphere)
        }
    },[currentAlgo])

    function setWallColors(hexaSphere,index){
        hexaSphere.allTiles.forEach(tile=>
            tile.setWallColors(index)
        )
        hexaSphere.walls.geometry.elementsNeedUpdate = true;
    }

    useEffect(()=>{

        if(currentAlgo!==options.Algorithm){
            modifyOptions('Mode','Rotate')
            setMaze(false)
            setMazeAstar(false)
            resetHexasphere(hexaSphere,aStarRef,savedData)
            setCurrentAlgo(options.Algorithm)
        }

        if(options.Obstacles==='Set random'){
            addObstacles(hexaSphere)
            modifyOptions('Obstacles',null)
        }
        if(options.Obstacles==='Clear All'){
            clearObstacles(hexaSphere)
            modifyOptions('Obstacles',null)
        }

        if(options.Simulation==='Start'){
            if(options.Algorithm==='Maze Creator'){
                setMaze(true)
            }

            if(aStarRef.current.currentStart&&aStarRef.current.currentTarget){

                if(options.Algorithm==='Maze Pathfinder'){
                    startMazeAstar(aStarRef.current.currentStart,aStarRef.current.currentTarget)
                    // setMazeAstar(true)
                }         

                if(options.Algorithm==='Pathfinder'){
                    startAstar(aStarRef.current.currentStart,aStarRef.current.currentTarget);                    
                }     
            
            modifyOptions('Simulation',null)
            }
        }

        if(options.Simulation==='Reset'){
            setMaze(false)
            resetHexasphere(hexaSphere,aStarRef,savedData)
            modifyOptions('Simulation',null)
        }

        addPathLine(aStarRef.current.path,pathLine)

    },[options])

    function startMazeAstar(start,target){

        console.log(start,target)

        let tiles=hexaSphere.allTiles;

        tiles.forEach(tile => {
            tile.f=0;
            tile.g=0;
            tile.h=0;
            tile.current=false;
            tile.previous=false;
            if(tile.id!==start.id&&tile.id!==target.id&&!tile.obstacle){
                tile.setColor(0)
            }
        });

        aStarRef.current={
            currentStart:start,
            currentTarget:target,
            openSet:[start],
            closedSet:[],
            path:[],
            noSolution:false,
            start:tiles[0],
            end:target,
        }  

        setMazeAstar(true)
    }

    function startAstar(start,target){

        let tiles=hexaSphere.allTiles;

        tiles.forEach(tile => {
            tile.f=0;
            tile.g=0;
            tile.h=0;
            tile.current=false;
            tile.previous=false;
            if(tile.id!==start.id&&tile.id!==target.id&&!tile.obstacle){
                tile.setColor(0)
            }
        });

        aStarRef.current={
            currentStart:start,
            currentTarget:target,
            openSet:[start],
            closedSet:[],
            path:[],
            noSolution:false,
            start:tiles[0],
            end:target,
        }  

        setAstar(true)
    }

    function selectHexagon(e){
        
        if(e.face.parent&&mouseDown&&options.Mode==='AddWalls'){
            e.face.parent.setColor(17)
            e.face.parent.setWallColors(1)

            e.face.parent.obstacle=true
            hexaSphere.mesh.geometry.elementsNeedUpdate = true;
            hexaSphere.walls.geometry.elementsNeedUpdate = true;
            if(aStarRef.current.currentStart&&aStarRef.current.currentTarget){
                startAstar(aStarRef.current.currentStart,aStarRef.current.currentTarget);
            }
        }  
    }

    function clickHexagon(e){
        
        if(e.face.parent&&options.Mode==='Add Start'){
            
            if(aStarRef.current.currentStart){              
                aStarRef.current.currentStart.start=false
                aStarRef.current.currentStart.setColor(0)
                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
            }
            e.face.parent.setColor(18)
            e.face.parent.start = true
            aStarRef.current.currentStart=e.face.parent
            hexaSphere.mesh.geometry.elementsNeedUpdate = true;           
        }

        if(e.face.parent&&options.Mode==='Add Target'){
            if(aStarRef.current.currentTarget){
                aStarRef.current.currentTarget.target=false
                aStarRef.current.currentTarget.setColor(0)
            }
            e.face.parent.setColor(19)
            e.face.parent.target=true;
            aStarRef.current.currentTarget=e.face.parent
            hexaSphere.mesh.geometry.elementsNeedUpdate = true;
        }
        if(
            aStarRef.current.currentStart&&
            aStarRef.current.currentTarget&&
            options.Mode!=='Rotate'
        ){
            if(options.Algorithm==='Pathfinder'){
                startAstar(aStarRef.current.currentStart,aStarRef.current.currentTarget);
            }
            if(options.Algorithm==='Maze Pathfinder'){
                startMazeAstar(aStarRef.current.currentStart,aStarRef.current.currentTarget)
            }
            
        }
    }

    function mousePressed(){
        if(options.Mode!=='Rotate'){
            group.current.parent.__objects[0].enabled=false
            setMouseDown(true)            
        }
    }

    function mouseUp(){
        group.current.parent.__objects[0].enabled=true
        setMouseDown(false)
    }

    return (
        <group
            ref={group}
            onClick={e => clickHexagon(e)}
            onPointerMove={e => selectHexagon(e)}
            onPointerDown={e => mousePressed()}
            onPointerUp={e =>  mouseUp()}
            onPointerOut={e => mouseUp()}
        >

            <Pathfinder
                astar={astar}
                setAstar={setAstar}
                hexaSphere={hexaSphere}
                aStarRef={aStarRef}
                pathLine={pathLine}
            />

            <Maze 
                hexaSphere={hexaSphere}
                maze={maze}
                setMaze={setMaze}
                savedData={savedData}
            />

            <MazeAstar
                hexaSphere={hexaSphere}
                astar={mazeAstar}
                setAstar={setAstar}
                savedData={savedData}
                aStarRef={aStarRef}
                options={options.sphere}
                pathLine={pathLine}
            />

            <PathLine 
                options={options.sphere}
                pathLine={pathLine}
            />
            
            <Rotation 
                hexaSphere={hexaSphere}
                group={group}
            />

        </group>
    )
}
