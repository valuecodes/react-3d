import React,{useRef,useState,useEffect} from 'react'
import { useFrame } from 'react-three-fiber'
import Vertice from './vertice'
import { PlaneGeometry, Vector3, Math, DoubleSide, BufferGeometry, ArrowHelper } from "three";
export default function CustomBox(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef()
    const [cube, setCube] = useState([]);
    // Set up state for the hovered and active state

    useEffect(() => {
      let vertices=mesh.current.geometry.vertices.map(ver => ver);
      setCube(vertices)
    },[props])

    useFrame(() => {
     if(mesh.current){
        mesh.current.geometry.verticesNeedUpdate = true;
      }
    })

    const updateX=(cor,index)=>{
      console.log(cor)
      let updatedCube=[...cube];
      updatedCube[index].x=cor;
      setCube(updatedCube);
      mesh.current.geometry.vertices[index].x=cor
      // mesh.current.verticesNeedUpdate = true;
    }

    const updateY=(cor,index)=>{
      let updatedCube=[...cube];
      updatedCube[index].y=cor;
      setCube(updatedCube);
      mesh.current.geometry.vertices[index].y=cor
      // mesh.current.verticesNeedUpdate = true;
    }

    const updateZ=(cor,index)=>{
      let updatedCube=[...cube];
      updatedCube[index].z=cor;
      setCube(updatedCube);
      mesh.current.geometry.vertices[index].z=cor
      // mesh.current.verticesNeedUpdate = true;
    }

    return (
      <>
      <mesh
        {...props}
        onHover={e => console.log(e.target.value)}
        ref={mesh}
        scale={[1,1,1]}
        verticesNeedUpdate={true}>
        <boxGeometry attach="geometry" args={[10,10,10]} />
        <meshStandardMaterial  attach="material" color='blue' /> <axesHelper args={[20,20,20]}/>   

        {cube.map((cor,index)=>
          <Vertice position={Object.values(cor)} updateX={updateX} updateY={updateY} updateZ={updateZ} key={index} index={index}/>
        )}
        <arrowHelper/>
      </mesh>
        {/* <gridHelper args={[200,20,'red','blue']} /> */}
      </>

    )
  }