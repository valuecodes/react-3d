import React,{ useState, useEffect } from 'react'
import { computeFaceCentroids, computetaEdgeCentroids } from './../calculations/calculations'
import DragPoint from './dragPoint'
import Faces from './faces'
import { extend, Canvas, useRender, useThree, useResource, useFrame } from 'react-three-fiber'



import Edges from './v1/edges'

export default function MeshEdit({current}) {

    const [vertices, setVertices] = useState([]);
    const [faces, setFaces] = useState([]);
    const [edges, setEdges] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [selectedFace, setSelectedFace]=useState(null);

    useEffect(()=>{
        let newVertices = current.current.geometry.vertices.map(ver => ver);
        let newFaces=computeFaceCentroids(current.current.geometry)
        let newEdges=computetaEdgeCentroids(current.current.geometry)
        console.log(newEdges)
        setVertices(newVertices)
        setFaces(newFaces)
    },[current])



    useFrame(() => {
        if(updated){
            current.current.geometry.verticesNeedUpdate = true;               current.current.geometry.normalsNeedUpdate = true;
            setUpdated(false)
         }
       })

    const updateVertices=(newPosition, index)=>{
       let updatedVertices=[...vertices];
       updatedVertices[index]=newPosition;
       current.current.geometry.vertices[index].x=newPosition.x;
       current.current.geometry.vertices[index].y=newPosition.y;
       current.current.geometry.vertices[index].z=newPosition.z;
       setVertices(updatedVertices);
       setUpdated(true);
       let updatedFaces=computeFaceCentroids(current.current.geometry)
       setFaces(updatedFaces);
      }
      
    function updateFaces(newPosition,start,startingPosition, index){

        let newStart={...startingPosition}

        let xAmount=newPosition.x-start.x
        let yAmount=newPosition.y-start.y
        let zAmount=newPosition.z-start.z
    
        let id1=newStart[0].index
        let id2=newStart[1].index
        let id3=newStart[2].index
    
        let xStart1=newStart[0].a.x+xAmount
        let xStart2=newStart[1].b.x+xAmount
        let xStart3=newStart[2].c.x+xAmount
    
        let yStart1=newStart[0].a.y+yAmount
        let yStart2=newStart[1].b.y+yAmount
        let yStart3=newStart[2].c.y+yAmount
        
        let zStart1=newStart[0].a.z+zAmount
        let zStart2=newStart[1].b.z+zAmount
        let zStart3=newStart[2].c.z+zAmount
    
        let updatedVertices=[...vertices];
    
        current.current.geometry.vertices[id1].x=xStart1;
        current.current.geometry.vertices[id2].x=xStart2;
        current.current.geometry.vertices[id3].x=xStart3;
    
        current.current.geometry.vertices[id1].y=yStart1;
        current.current.geometry.vertices[id2].y=yStart2;
        current.current.geometry.vertices[id3].y=yStart3;
    
        current.current.geometry.vertices[id1].z=zStart1;
        current.current.geometry.vertices[id2].z=zStart2;
        current.current.geometry.vertices[id3].z=zStart3;
    
        updatedVertices[id1].x=xStart1;
        updatedVertices[id2].x=xStart2;
        updatedVertices[id3].x=xStart3;
    
        updatedVertices[id1].y=yStart1;
        updatedVertices[id2].y=yStart2;
        updatedVertices[id3].y=yStart3;
    
        updatedVertices[id1].z=zStart1;
        updatedVertices[id2].z=zStart2;
        updatedVertices[id3].z=zStart3;   
    
        setVertices(updatedVertices);
        setUpdated(true)
        let updatedFaces=computeFaceCentroids(current.current.geometry)
        setFaces(updatedFaces);
    }

    function selectFace(index){
        setSelectedFace(index===selectedFace?null:index);
    }

    return (
        <>
            {vertices.map((position,index)=>
                <DragPoint 
                    updateVertices={updateVertices} 
                    current={current} 
                    position={Object.values(position)} 
                    key={index} 
                    index={index}
                    type={'vertice'}
                    selectedFace={selectedFace}
                />
            )}
            {faces.map((position,index)=>
                <DragPoint 
                    updateFaces={updateFaces} 
                    current={current} 
                    position={Object.values(position)} 
                    key={index} 
                    index={index}
                    type={'face'}
                />
            )}
            <Faces 
                current={current} 
                faces={faces} 
                selectFace={selectFace}
                selectedFace={selectedFace}    
            />
        </>
    )
}
