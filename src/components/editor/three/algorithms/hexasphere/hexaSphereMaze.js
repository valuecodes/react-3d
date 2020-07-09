import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import Maze from './../shapes/hexasphere/maze'

export default function HexaSphereMaze() {

    const [hexaSphere, setHexaSphere]=useState(null);
    let savedData=useRef({
        current:0,
        stack:[],
        count:2,
    })

    const [maze, setMaze]=useState(false)
    const [astar, setAstar]=useState(false)

    const [options, setOptions]=useState({
        size:50,
        detail:4,
        wallWidth:4,
        obstacles:false,
        pathLine:'white',
        wallColors:{
            unvisited:'black',
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
            openSet:'green',
            closedSet:'orange',
            path:'blue',
            obstacle:'#262729',
        },
    })

    useEffect(()=>{
        let hexagonSphere = createHexasphere(options,group)
        group.current.add(hexagonSphere.mesh)
        group.current.add(hexagonSphere.walls)
        setHexaSphere(hexagonSphere)
        setMaze(true)
    },[])

    const group=useRef();

    return (
        <group
            position={[0,-20,0]}
            ref={group}
        >
            <Maze 
                hexaSphere={hexaSphere}
                maze={maze}
                setMaze
                savedData={savedData}
            />
        </group>
    )
}
