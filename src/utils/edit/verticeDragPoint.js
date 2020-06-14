import React,{ useState, useRef, useEffect } from 'react'
import TransformControl from './transformControl'
import { useResource, useFrame } from 'react-three-fiber'

export default function DragPoint(props) {

    const {
        updateVertices, 
        updateFaces, 
        index, 
        type,
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
    const [dragType, setType] = useState(null)

    const [faceVertice, setFacevertice]=useState(null);

    useEffect(()=>{
        console.log(selectedFace);
        if(type==='face' && selectedFace===index){
            select();
        }else{
            setSelected(false)
        }
        // select();
    },[selectedFace])

    useEffect(() => {
        setType(type)

    }, [type])

    const select=()=>{        
        console.log(index,ref.current.position)
        if(type==='face'&&faceVertice===null){
            let savedVertices=getFaceVerticePositions(current.current.geometry, index)
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
                console.log(ref.current.position)
                updateVertices(ref.current.position, index);
                setLastPosition(JSON.stringify(ref.current.position))         
            }
         }
       })
    return (
        <>
        <mesh
            onClick={e => select()}
            {...props}
            ref={ref}
            scale={[1,1,1]}>
            <boxGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial  attach="material" 
            color={selected?'red':'green'} 
            />  
            
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