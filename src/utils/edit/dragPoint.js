import React,{ useState, useRef, useEffect } from 'react'
import TransformControl from './transformControl'
import { useResource, useFrame } from 'react-three-fiber'

export default function DragPoint(props) {

    const {
        updateVertices, 
        updateFaces, 
        index, 
        current,
        position,
        setFaceVertice,
        selectedFace
    } = props
    
    const [ref, mesh] = useResource()
    const [selected, setSelected]=useState(false);
    
    let faceVertices=useRef();

    const [lastPosition, setLastPosition]=useState(null);
    const [start, setStart]=useState(0);

    const [faceVertice, setFacevertice]=useState(null);

    useEffect(()=>{
        if(selectedFace===index){
             select();
        }else{
            setSelected(false)
            setFacevertice(null)
            setStart(0);            
        }
    },[selectedFace])


    const select=()=>{        
        if(faceVertice===null){
            let savedVertices=getFaceVerticePositions(current.geometry, index)
            setFacevertice(savedVertices)
        }else{
            setFacevertice(null)
        }
        setStart({...ref.current.position});
        setSelected(!selected);
    }

    useFrame(() => {
        if(selected){
            if(JSON.stringify(ref.current.position)!==lastPosition){
                updateFaces(ref.current.position,start,faceVertice,index);
                setLastPosition(JSON.stringify(ref.current.position))         
            }
         }
       })
    return (
        <>
        <mesh
            {...props}
            ref={ref}
            >
            {/* <boxGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial  attach="material" 
            color={selected?'red':'green'} 
            /> */}
      </mesh>
      <TransformControl mesh={mesh} selected={selected}/>
      </>
    )
}

function getFaceVerticePositions(geometry, index){
    console.log(geometry)
    let faces =JSON.parse(JSON.stringify(geometry.faces))
    let vertices=JSON.parse(JSON.stringify(geometry.vertices))

    let a=faces[index].a;
    let b=faces[index].b;
    let c=faces[index].c;

    let faceVertices=[
        {a:vertices[faces[index].a],index:faces[index].a},
        {b:vertices[faces[index].b],index:faces[index].b},
        {c:vertices[faces[index].c],index:faces[index].c}        
    ];    
    return faceVertices
  }