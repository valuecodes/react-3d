import React,{useState,useEffect} from 'react'
import GridBlock from './gridBlock'

// Camera
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ReactDOM from 'react-dom'
import { extend, useThree } from 'react-three-fiber'
extend({ OrbitControls })

export default function GroundBlock() {

    const [grid,setGrid]=useState([]);

    useEffect(()=>{
        let newGrid=[];
        for(var i=0;i<16;i++){
            for(var a=0;a<16;a++){
                newGrid.push([i*10,(a*10),-100])
            }
        }
        setGrid(newGrid)
    },[])

    // Camera
    const {
        camera,
        gl: { domElement }
      } = useThree()
      
    // Top
    camera.position.set(0,0,120);
    
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
            <orbitControls args={[camera, domElement]}/>
            {grid.map(block=>
                <GridBlock position={block}/>
            )}
        </>
    )
}
