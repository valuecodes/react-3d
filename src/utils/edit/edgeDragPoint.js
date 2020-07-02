import React,{useRef, useState, useEffect} from 'react'
import { useResource, useFrame } from 'react-three-fiber'
import TransformControl from './transformControl'
import { Vector3 } from 'three';

export default function EdgeDragPoint(props) {
    const [ref, mesh] = useResource()
    const {
        index, 
        current,
        position,
        selected,
        edge,
        selectEdge,
        select,
        hover,
        updateEdge
    } = props

    const [lastPosition, setLastPosition]=useState(null);
    const [start, setStart]=useState(0);
    const [edgeVertices, setEdgeVertices]=useState(null);

    useEffect(()=>{
        if(selected){
             setEdgeVertices(JSON.parse(JSON.stringify(edge.points)))
             setStart({...ref.current.position});
        }else{
            setEdgeVertices(null)
            setStart(0);            
        }
    },[selected])
    
    useFrame(() => {
        if(selected){
            if(JSON.stringify(ref.current.position)!==lastPosition){
                let newPos=JSON.parse(JSON.stringify(ref.current.position))
                let updatedPositions=[];
                for(var i=0;i<edge.verticeIndex.length;i++){
                    updatedPositions.push({
                        vertice:edge.verticeIndex[i],
                        vector:new Vector3( 
                            edgeVertices[i].x+newPos.x-start.x,
                            edgeVertices[i].y+newPos.y-start.y,
                            edgeVertices[i].z+newPos.z-start.z,
                        )
                    }
                    )
                }
                updateEdge(updatedPositions)
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
        />   */}
        
      </mesh>
      <TransformControl mesh={mesh} selected={selected}/>
      </>
    )
}
