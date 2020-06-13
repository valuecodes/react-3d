import React,{useRef,useEffect, useState} from 'react'
import { useFrame } from 'react-three-fiber'

export default function Plane( props) {

    const { position, points } = props

    const plane = useRef()

    useEffect(()=>{
        // let vertices=plane.current.geometry.vertices.map(ver => ver);
        console.log(plane.current.geometry.planes)

        let newPoints=[...points]
        console.log(newPoints[2])
        let copy=newPoints[2];
        newPoints[2]=newPoints[3];
        newPoints[3]=copy;
        console.log(newPoints)
        plane.current.geometry.vertices=newPoints
        plane.current.geometry.verticesNeedUpdate = true;
        // setPoints(vertices) 
    },[props])

    useFrame(() => {
        console.log(plane.current)
        if(plane.current){
            
            plane.current.geometry.vertices=points
            plane.current.geometry.verticesNeedUpdate = true;
         }
       })

    console.log(props);
    return (
        <mesh 
        // {...position}
        ref={plane}
        >
            <planeGeometry attach="geometry" args={[8,20,1]}/>       
            <meshBasicMaterial attach="material" color="green" />            
        </mesh>
    )
}
