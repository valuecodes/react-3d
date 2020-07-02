import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import CubeCells from './../shapes/cubecells'
import VertexNormals from './../../../../../utils/helpers/vertexNormals'

export default function HexaSphere() {

    const [tiles, setTiles]=useState([]);

    const [options, setOptions]=useState({
        size:30,
        cellSize:3,        
        // cellSize:1,        
    })


    useEffect(()=>{
        let hexagonSphere = createHexasphere(options)
        console.log(hexagonSphere)
        setTiles(hexagonSphere)
    },[])

    const ring=useRef();

    return (
        <>
        <group
            position={[0,-20,0]}
        >
            <CubeCells cubeCells={tiles} />
            <mesh
            // onClick={e => console.log(ring)}
            ref={ring}
            position={[0,0,0]}
            >
                <icosahedronBufferGeometry attach="geometry" args={[options.size,1]}/>
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
