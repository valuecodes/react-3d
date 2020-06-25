import React,{ useRef, useState, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import { disposeElements } from './../../../../../utils/other/disposeElements'
export default function Tracker({ phase, pathCoordinates,mesh, listMesh, renderer }) {
    const [tracking, setTracking]=useState(false);
    const box=useRef();
    
    useEffect(()=>{
        console.log(phase)
        if(phase==='trackPath'){
            startTracking(phase==='trackPath')
        }
    },[phase])

    useEffect(()=>{
        return () => disposeElements(box.current, renderer)
    },[])

    function startTracking(trackPath){
        box.current.position.x=0
        box.current.position.z=0
        box.current.scale.y=1
        box.current.rotation.x=-Math.PI/2
        listMesh[2].children[0].material.color.set('green')
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

            pathCoordinates.count+=1
            listMesh[2].text='Tracking Path...'+(count/((path.length-1)*5)*100).toFixed(2)+'%'


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
                    listMesh[2].text='Ready!'
                    listMesh[2].children[0].material.color.set('black')
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
            <sphereBufferGeometry attach="geometry" args={[2, 32, 32]}/>
            <meshBasicMaterial attach="material" color={'steelblue'} visible={false}/>
        </mesh>
    )
}
