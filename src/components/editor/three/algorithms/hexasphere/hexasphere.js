import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import CubeCells from './../shapes/cubecells'
import VertexNormals from './../../../../../utils/helpers/vertexNormals'

export default function HexaSphere() {

    const [tiles, setTiles]=useState([]);

    const [options, setOptions]=useState({
        size:80,
        detail:4,
        colorScheme:{
            q1:'#262729',
            q2:'#262729',
            q3:'#262729',
            q4:'#262729',
            q5:'#262729',
            q6:'#262729',
            q7:'#262729',
            q8:'#262729',
            seam:'#262729',
            pentagon:'#262729'
        },
        // colorScheme:{
        //     q1:'yellow',
        //     q2:'blue',
        //     q3:'brown',
        //     q4:'seagreen',
        //     q5:'gold',
        //     q6:'green',
        //     q7:'purple',
        //     q8:'pink',
        //     seam:'#262729',
        //     pentagon:'black'
        // }
    })


    useEffect(()=>{
        let hexagonSphere = createHexasphere(options,group)
        // console.log(hexagonSphere)
        setTiles(hexagonSphere)
    },[])

    const group=useRef();

    return (
        <>
        <group
            position={[0,-20,0]}
            ref={group}
        >
            <CubeCells cubeCells={tiles} />
            <mesh
            // onClick={e => console.log(ring)}
            // ref={ring}
            position={[0,0,0]}
            >
                {/* <icosahedronBufferGeometry attach="geometry" args={[options.size,1]}/> */}
                <meshBasicMaterial attach="material" color='gray' side={2} 
                // wireframe
                />
                {/* <VertexNormals current={ring.current} /> */}
            </mesh>
        </group>

        
        {/* <mesh
        onClick={e => console.log(ring)}
        ref={ring}

        >
            <circleBufferGeometry attach="geometry" args={[50,6]}/>
            <meshBasicMaterial attach="material" color='green' side={2}/>
        </mesh> */}

        </>
    )
}
