import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import MazeAstar from './../shapes/hexasphere/mazeAstar'
import PathLine from './../shapes/hexasphere/pathline'
import download from './../shapes/download'
import mazes from './../shapes/hexasphere/ReadyMazes'
import {
    calculateGroupPosition,
    calculateSpherePosition
} from './../../../../../utils/other/calculatePosition'

export default function HexaMazePathfinder() {

    const [hexaSphere, setHexaSphere]=useState(null);
    
    let savedData=useRef({
        current:0,
        stack:[],
        count:2,
    })

    let aStarRef=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })
    const group=useRef();
    const pathLine=useRef();
    const [astar, setAstar]=useState(false)

    const [options, setOptions]=useState({
        size:50,
        detail:5,
        wallWidth:3,
        obstacles:false,
        pathLine:'black',
        wallColors:{
            unvisited:'gray',
            visited:'red',
            notVisible:'',
        },
        colorScheme:{
            color:'#262729',
            q1:'#262729',
            q2:'#262729',
            q3:'#262729',
            q4:'#262729',
            q5:'#262729',
            q6:'#262729',
            q7:'#262729',
            q8:'#262729',
            seam:'#262729',
            pentagon:'#262729',
            notVisible:'',
            selected:'yellow',
            current:'purple',
            openSet:'seagreen',
            closedSet:'salmon',
            path:'white',
            obstacle:'#262729',
        }
    })

    useEffect(()=>{

        let hexagonSphere = createHexasphere(options,group)

        // hexagonSphere.mesh.position.set(...calculateSpherePosition(options.size))
        // hexagonSphere.walls.position.set(...calculateSpherePosition(options.size))
        group.current.add(hexagonSphere.mesh)
        group.current.add(hexagonSphere.walls)

        addMaze(hexagonSphere)
        setHexaSphere(hexagonSphere)
    },[])

    function addMaze(hexaSphere){
        let tiles=hexaSphere.allTiles
        let detail=options.detail;

        for(var i=0;i<tiles.length;i++){
            tiles[i].walls=mazes[detail][i][1].map(wall => wall===1?false:true)
            tiles[i].availableNeighbors=mazes[detail][i][0].map(neighbor => tiles[neighbor])
            tiles[i].setWalls()
        }
        hexaSphere.mesh.geometry.elementsNeedUpdate = true;
    }

    function startAstar(){

        let tiles=hexaSphere.allTiles
        let end=7000

        aStarRef.current={
            openSet:[tiles[0]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:tiles[0],
            end:tiles[end],
            currentTarget:null
        }  

        setAstar(true)
    }

    function createMaze(){
        let save= hexaSphere.allTiles.map(tile=>{
            return [
                tile.availableNeighbors.map(neighbor => neighbor.id),
                tile.walls.map(wall => wall?1:0)
            ]
        })
        download(JSON.stringify(save))
    }

    return (
        <group
            // position={calculateGroupPosition(options.size,5)}
            ref={group}
            onClick={e => startAstar()}
            // onClick={e => createMaze()}
        >
            <MazeAstar
                hexaSphere={hexaSphere}
                astar={astar}
                setAstar={setAstar}
                savedData={savedData}
                aStarRef={aStarRef}
                options={options}
                pathLine={pathLine}
            />

            <PathLine 
                options={options}
                pathLine={pathLine}
            />
            
        </group>
    )
}
