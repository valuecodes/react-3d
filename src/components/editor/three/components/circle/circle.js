import React,{useRef, useState, useEffect,useCallback,useMemo} from 'react'
import {  Vector3, Face3, DodecahedronBufferGeometry, BoxBufferGeometry,CircleBufferGeometry} from "three";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import LineVertice from './../line/lineVertice/lineVertice'
import Vertice from './../vertice/vertice'
import { Canvas, extend, useThree, useResource, mouse,useFrame  } from 'react-three-fiber'

export default function Circle(props) {
    // console.log(props);
    const {
        camera,
        mouse,
    } = useThree()
    const [object, setObject]=useState([]);
    const mesh = useRef()
    const bg = useRef()
    const box=useRef()
    const box2=useRef()

    const [selected, setSelected]=useState(null);
    const [position, setPosition]=useState([100,100,100])
    useEffect(() => {
        console.log(box.current)
        // let vertices=box.current.geometry.vertices.map(ver => ver);
        // setObject(vertices)
    },[props])

    const selectVertice=(index)=>{
        // setSelected(index);
        // setEdit(true)
      }
      useFrame(() => {
        if(mesh.current){
           mesh.current.geometry.verticesNeedUpdate = true;
         }
       })
   
       const updateX=(cor,index)=>{
         let updated=[...object];
         updated[index].x=cor;
         setObject(updated);
         mesh.current.geometry.vertices[index].x=cor
         // mesh.current.verticesNeedUpdate = true;
       }

       const updateY=(cor,index)=>{
        let updated=[...object];
        updated[index].y=cor;
        setObject(updated);
        mesh.current.geometry.vertices[index].y=cor
        // mesh.current.verticesNeedUpdate = true;
      }

      const updateZ=(cor,index)=>{
        let updated=[...object];
        updated[index].z=cor;
        setObject(updated);
        mesh.current.geometry.vertices[index].z=cor
      }
    // console.log(mesh.current)


    const addPoint=(e)=>{
        // if(mode==='add'){
            const newPoint = new Vector3(position[0],0,position[1] );
            setObject([...object,newPoint ])  
            mesh.current.geometry.faces.push(new Face3(0, 1, 2))


            mesh.current.geometry.computeVertexNormals();
            mesh.current.geometry.normalize();
            mesh.current.geometry.verticesNeedUpdate = true;
        // }
        
        // if(edit){
        //     setEdit(!edit)
        // }else{
        //     setSelected(null)
        // }
    }

    const trackPosition=(e)=>{
        // var vector = new Vector3( mouse.x,-1, mouse.y ).unproject( camera );
        let x = (mouse.x * window.innerWidth) / 10
        let y = ((mouse.y * window.innerHeight) / 15)*-1

        setPosition([x ,y,-150])
    }
    const geom = useMemo(() => {
        var geometry1 = new BoxBufferGeometry( 5, 2, 5 );
        var geometry2 = new BoxBufferGeometry( 5, 10, 10 );

        let merged= BufferGeometryUtils.mergeBufferGeometries([geometry1, geometry2]);
        return merged;
    })
    const geom2 = useMemo(() => new BoxBufferGeometry(15, 15))
    return (
        <>
        <mesh
        {...props}
        rotation={[-Math.PI/2,0,0]} 
        ref={mesh}
        scale={[2, 2, 2]}
        >

        {/* <boxBufferGeometry attach="geometry" args={geom} /> */}
        {/* <meshStandardMaterial  attach="material" color={selected?'red':'blue'}/>   */}

      <lineSegments
        ref={box}
      >
        <edgesGeometry attach="geometry" args={[geom]} />
            <lineBasicMaterial attach="material" color={'red'}/>
        </lineSegments>

    {/* <lineSegments
        ref={box2}
      >
        <edgesGeometry attach="geometry" args={[geom2]} />
            <lineBasicMaterial attach="material" color={'red'}/>
        </lineSegments> */}


        {object.map((point,index)=>

                <Vertice position={Object.values(point)} 
                selectVertice={selectVertice} 
                selected={selected} 
                key={index} 
                updateX={updateX}
                updateY={updateY}
                updateZ={updateZ}
                index={index}/>                
        )}
      </mesh>
      <mesh 
            onClick={e => addPoint(e)} 
            onPointerMove={e => trackPosition(e)}
            
            rotation={[-Math.PI/2,0,0]} 
            receiveShadow={true} 
            position={[0,-1,0]} 
            ref={bg}>
            <planeBufferGeometry attach="geometry" args={[1000, 1000, 1]} />
            <meshBasicMaterial attach="material" color="white" />
          </mesh>
      </>
    )
}
