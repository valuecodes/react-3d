import React,{ useRef, useState, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'

export default function Tracker({ trackPath, pathCoordinates }) {
    const [tracking, setTracking]=useState(false);
    const mesh=useRef();
    
    useEffect(()=>{
        if(trackPath){
            startTracking(trackPath)
        }
    },[trackPath])

    function startTracking(trackPath){
        mesh.current.position.x=0
        mesh.current.position.z=0
        mesh.current.scale.y=1
        // savedAstar.current.currentPosition=null
        setTracking(trackPath)
    }

    useFrame(()=>{
        if(tracking){
            
            let {path,currentPosition,currentTarget}=pathCoordinates;
            const tracker=mesh.current 
                
            if(currentTarget===null){
                currentTarget=path.length-2;
            }

            let xTarget=path[currentTarget].x*5
            let zTarget=path[currentTarget].z*5
            
            if(xTarget>tracker.position.x){
                tracker.position.x=tracker.position.x+1
            }

            if(xTarget<tracker.position.x){
                tracker.position.x=tracker.position.x-1
            }

            if(zTarget>tracker.position.z){
                tracker.position.z=tracker.position.z+1
            }
            if(zTarget<tracker.position.z){
                tracker.position.z=tracker.position.z-1
            }
            
            if(
                xTarget===tracker.position.x&&
                zTarget===tracker.position.z
            ){
                if(currentTarget===0){
                    setTracking(false)
                }
                currentTarget--;
            } 
            pathCoordinates.currentTarget=currentTarget
        }         
    })

    return (
        <mesh
            ref={mesh}
            scale={[1,0.1,1]}
        >
            <boxBufferGeometry attach="geometry" args={[3,3,3]}/>
            <meshBasicMaterial attach="material" color={'steelblue'}/>
        </mesh>
    )
}
