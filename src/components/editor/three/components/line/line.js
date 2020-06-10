import React, { useMemo, useCallback, useRef,useState,useEffect } from 'react'
import ReactDOM from 'react-dom'
import {  Vector3 } from "three";
import HelperGrid from './../../../../../utils/helpers/helperGrid'
import { Canvas, extend, useThree, useResource, mouse,useFrame } from 'react-three-fiber'
import { transcode } from 'buffer';
import LineVertice from './lineVertice/lineVertice'

export default function Line({cameraSettings}) {
    const {orbit, mode}=cameraSettings
    const [position, setPosition]=useState([100,100,100])
    const [selected, setSelected]=useState(null);
    const [edit, setEdit] =useState(false);
    
    const {
        camera,
        mouse
    } = useThree()
    
    const [points, setPoints]=useState([
        new Vector3(0, 0, 0), 
        new Vector3(15, 0, 10), 
        new Vector3(0, 0, 20)
    ])

    const line = useRef()
    const mesh = useRef();

    // const points = useMemo(() => [

    const onUpdate = useCallback(self => self.setFromPoints(points), [points])

    const addPoint=(e)=>{
        if(mode==='add'){
            const newPoint = new Vector3(position[0],0,position[1] );
            setPoints([...points,newPoint ])            
        }
        
        if(edit){
            setEdit(!edit)
        }else{
            setSelected(null)
        }
    }

    const trackPosition=(e)=>{
        let x = (mouse.x * window.innerWidth) / 10
        let y = ((mouse.y * window.innerHeight) / 15)*-1

        setPosition([x ,y,-150])
    }

    useFrame(() => {
        if(mesh.current){
            mesh.current.position.x=position[0]
            mesh.current.position.z=position[1]
        }
        
        if(selected!==null){
            let updatedPoints=[...points];
            updatedPoints[selected].x=position[0]
            updatedPoints[selected].z=position[1]
            setPoints(updatedPoints);
        }
      })

      const selectVertice=(index)=>{
        console.log(index)
        setSelected(index);
        setEdit(true)
      }

    return (
        <>
        <line
            position={[0, 0, 0]} ref={line}>
            <bufferGeometry attach="geometry" onUpdate={onUpdate} />
            <lineBasicMaterial attach="material" color={'blue'} linecap={'round'} linejoin={'round'} />            
        </line>
        <mesh 
            onClick={e => addPoint(e)} 
            onPointerMove={e => trackPosition(e)}
            rotation={[-Math.PI/2,0,0]} 
            receiveShadow={true} 
            position={[0,-1,0]} 
            ref={mesh}>
            <planeBufferGeometry attach="geometry" args={[1000, 1000, 1]} />
            <meshBasicMaterial attach="material" color="white" />
          </mesh>
        <mesh
        onMouseOver={e => trackPosition(e)}
        ref={mesh}
        scale={[2,2,2]}>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshStandardMaterial attach="material" color={'orange'} />
        </mesh>
        {points.map((point,index)=>{
            if(mode==='edit'){
                return <LineVertice position={Object.values(point)} selectVertice={selectVertice} selected={selected} key={index} index={index}/>                
            }

        })}
        </>

    )
}
