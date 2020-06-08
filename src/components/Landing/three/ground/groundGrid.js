import React,{useState, useEffect, useRef} from 'react'
import GridBlock from './gridBlock'

// Camera
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ReactDOM from 'react-dom'
import { extend, useThree, useFrame } from 'react-three-fiber'
extend({ OrbitControls })

export default function GroundGrid({cameraPosition}) {

    const [grid, setGrid]=useState([]);
    const [cameraPos, setCameraPos]=useState([0,0,120])
    const cameraRef =useRef();
    
    // Camera
    const {
        camera,
        gl: { domElement }
      } = useThree()


    useEffect(()=>{
        let newGrid=[];
        for(var i=-8;i<=8;i++){
            for(var a=-8;a<=8;a++){
                newGrid.push([i*10,(a*10),-100])
            }
        }
        setGrid(newGrid)
    },[])

    useEffect(()=>{
        console.log(cameraPosition)
        camera.position.set(...cameraPosition);
        cameraRef.current.update();
    },[cameraPosition])


    // Top
    // camera.position.set(0,0,120);
    
    // front
    // camera.position.set(0,-90,120);

    // Bottom
    // camera.position.set(0,0,-120);

    // Side
    // camera.position.set(0,90,0);

    //   camera.position.set(0,0,100);
    //   camera.position.set(0,0,-5);
    return (
        <>
            <orbitControls ref={cameraRef} args={[camera, domElement]}/>
            {grid.map(block=>
                <GridBlock position={block}/>
            )}
        </>
    )
}
