import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import Pathfinder from './../shapes/hexasphere/pathfinder'
import PathLine from './../shapes/hexasphere/pathline'

export default function HexaSphereMaze() {

    const [hexaSphere, setHexaSphere]=useState(null);
    const pathLine=useRef();
    const [astar, setAstar]=useState(false)
    const [mouseDown,setMouseDown]=useState(false)

    const [options, setOptions]=useState({
        size:50,
        detail:5,
        wallWidth:false,
        obstacles:false,
        pathLine:'white',
        wallColors:{
            unvisited:'black',
            visited:'red',
            notVisible:'',
        },
        colorScheme:{
            color:'gray',
            q1:'lightgray',
            q2:'lightgray',
            q3:'lightgray',
            q4:'lightgray',
            q5:'lightgray',
            q6:'lightgray',
            q7:'lightgray',
            q8:'lightgray',
            seam:'lightgray',
            pentagon:'lightgray',
            notVisible:'',
            selected:'yellow',
            current:'purple',
            openSet:'green',
            closedSet:'salmon',
            path:'blue',
            obstacle:'#262729',
        },
        // colorScheme:{
        //     q1:'red',
        //     q2:'blue',
        //     q3:'brown',
        //     q4:'seagreen',
        //     q5:'gold',
        //     q6:'green',
        //     q7:'purple',
        //     q8:'pink',
        //     seam:'#262729',
        //     pentagon:'black',
        //     notVisible:'',
        //     selected:'yellow',
        //     current:'purple',
        //     openSet:'green',
        //     closedSet:'orange',
        //     path:'blue'
        // }
    })

    useEffect(()=>{
        let hexagonSphere = createHexasphere(options,group)
        group.current.add(hexagonSphere.mesh)
        group.current.add(hexagonSphere.walls)

        // let tiles=hexagonSphere.allTiles
        // let currentTile=tiles[0]
        // let next=1

        // removeWalls(0, next, hexagonSphere);

        let end=7000

        let tiles=hexagonSphere.allTiles
        aStarRef.current={
            openSet:[tiles[5]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:tiles[5],
            end:tiles[end],
            currentTarget:null
        }  

        hexagonSphere.allTiles[end].obstacle=false;
        hexagonSphere.allTiles[end].setColor(0)


        setHexaSphere(hexagonSphere)
        // setAstar(true)
    },[])

    let aStarRef=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    const group=useRef();

    function selectHexagon(e){
        
        if(e.face.parent&&mouseDown){
            e.face.parent.setColor(13)
            hexaSphere.mesh.geometry.elementsNeedUpdate = true;
        }
        
    }
    console.log(mouseDown)
    return (
        <group
            // position={[0,0,0]}
            ref={group}
            onClick={e => selectHexagon(e)}
            onPointerMove={e => selectHexagon(e)}
            onPointerDown={e => setMouseDown(true)}
            onPointerUp={e => setMouseDown(false)}
        >
            <Pathfinder
                astar={astar}
                setAstar={setAstar}
                hexaSphere={hexaSphere}
                aStarRef={aStarRef}
                pathLine={pathLine}
            />

            <PathLine 
                options={options}
                pathLine={pathLine}
            />

        </group>
    )
}

