import React, { useMemo, useCallback, useRef,useState,useEffect } from 'react'
import ReactDOM from 'react-dom'
import {  Vector3} from "three";
import HelperGrid from './../../../../../utils/helpers/helperGrid'
import { Canvas, extend, useThree, useResource, mouse,useFrame  } from 'react-three-fiber'
import { transcode } from 'buffer';
import LineVertice from './lineVertice/lineVertice'
import Tracker from './../../../../../utils/other/tracker'
import BackgroundPlane from './../../../../../utils/other/backgroundPlane'
import Plane from './mesh/plane'

import BoxBuffer from './boxBuffer/boxBuffer'

export default function LineLoop({cameraSettings}) {
    const {orbit, mode}=cameraSettings
    const [position, setPosition]=useState([100,100,100])
    const [selected, setSelected]=useState(null);
    const [edit, setEdit] =useState(false);

    const [objects, setObjects]=useState([]);
    
    const {
        camera,
        mouse,
    } = useThree()
    
    const [points, setPoints]=useState([
        // new Vector3(-4, 1, 10), 
        // new Vector3(-4, 1, -10), 
        // new Vector3(4, 1, 10),
        // new Vector3(4, 1, -10),
        // new Vector3(6, 1, -5),
        // new Vector3(8, 1, -10)
    ])

    const line = useRef()
    const mesh = useRef();
    const plane = useRef()

    const onUpdate = useCallback(self => self.setFromPoints(points), [points])

    const addPoint=(e)=>{
        if(mode==='add'){
            const newPoint = new Vector3(position[0],0,position[1] );
            setPoints([...points,newPoint ])    
                    
        }
        if(points.length===3){

            let newObjects=[...objects]
            newObjects.push({
                position:[position[0],0,position[1]],
                points:points
            })
            setObjects(newObjects)
        }
        
        console.log(objects)
        if(edit){
            setEdit(!edit)
        }else{
            setSelected(null)
        }
    }

    useFrame(() => {

        if(selected!==null){
            let updatedPoints=[...points];
            updatedPoints[selected].x=position[0]
            updatedPoints[selected].z=position[1]
            setPoints(updatedPoints);
        }
      })

      const selectVertice=(index)=>{
        setSelected(index);
        setEdit(true)
      }
      
    const downHandler = ({ key }) => {
        if(key==='Delete' && selected!==null){
            let updatedPoints=[...points];
            updatedPoints.splice(selected,1);
            setPoints(updatedPoints)
            setEdit(false);
            setSelected(null)
        }
      }

      useEffect(() => {
        window.addEventListener('keydown', downHandler)
    
        return () => {
            window.removeEventListener('keydown', downHandler)
        };
      });

      useEffect(()=>{
        
      },[cameraSettings])


    useEffect(()=>{
        let vertices=plane.current.geometry.vertices.map(ver => ver);

        plane.current.geometry.vertices=points
        plane.current.geometry.verticesNeedUpdate = true;
        // setPoints(vertices) 
    },[])

    useFrame(() => {
        if(plane.current){
            // plane.current.geometry.vertices=points
            // plane.current.geometry.verticesNeedUpdate = true;
         }
       })

       
    return (
        <>
         
        <mesh
            ref={plane}
            // rotation={[-Math.PI/2,0,0]} 
        >
        <line
            onKeyDown={e => console.log(e)}
             ref={line}>
             
            <bufferGeometry attach="geometry" onUpdate={onUpdate} />
            <lineBasicMaterial attach="material" color={'blue'} linecap={'round'} linejoin={'round'} />         

        </line>   
            <planeGeometry attach="geometry" args={[8,20,1]}/>       
            <meshBasicMaterial attach="material" color="green" />   

        {objects.map(object =>
            <Plane position={object} points={points}/> 
        )}
                
        </mesh>


        <Tracker position={position}/>
        <BackgroundPlane addPoint={addPoint} setPosition={setPosition}/>

        {points.map((point,index)=>{
            if(mode==='edit'){
                return <LineVertice position={Object.values(point)} selectVertice={selectVertice} selected={selected} key={index} index={index}/>                
            }
        })}
        </>

    )
}
