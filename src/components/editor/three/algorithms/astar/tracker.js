import React,{ useRef, useState, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import { disposeElements } from './../../../../../utils/other/disposeElements'

export default function Tracker({ phase, pathCoordinates,mesh, listMesh,renderer }) {
    const [tracking, setTracking]=useState(false);
    const box=useRef();
    
    useEffect(()=>{
        return () => disposeElements(box.current,renderer)
    },[])

    useEffect(()=>{
        if(phase==='trackPath'){
            startTracking(phase==='trackPath')
        }
    },[phase])

    function startTracking(trackPath){
        box.current.position.x=0
        box.current.position.z=0
        box.current.scale.y=1
        box.current.rotation.x=-Math.PI/2
        listMesh[1].children[0].material.color.set('green')
        pathCoordinates.count=1;
        box.current.material.visible=true;
        setTracking(trackPath)
    }

    useFrame(()=>{
        if(tracking){
            
            let {path,currentPosition,currentTarget,count}=pathCoordinates;
            const tracker=box.current 

            if(currentTarget===null){
                currentTarget=path.length-2;
            }

            let speed=1;
            pathCoordinates.count+=speed
            listMesh[1].text='Tracking Path...'+(count/((path.length-1)*5)*100).toFixed(2)+'%'
            
            let xTarget=path[currentTarget].x*5
            let zTarget=path[currentTarget].z*5

            
            
            if(xTarget>tracker.position.x){
                tracker.position.x=Number((tracker.position.x+speed).toFixed(1))
            }

            if(xTarget<tracker.position.x){
                tracker.position.x=Number((tracker.position.x-speed).toFixed(1))
            }

            if(zTarget>tracker.position.z){
                tracker.position.z=Number((tracker.position.z+speed).toFixed(1))
            }
            if(zTarget<tracker.position.z){
                tracker.position.z=Number((tracker.position.z-speed).toFixed(1))
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
            ref={box}
            scale={[1,0.1,1]}
        >
            <sphereBufferGeometry attach="geometry" args={[1, 32, 32]}/>
            <meshBasicMaterial attach="material" color={'red'} visible={false}/>
        </mesh>
    )
}
