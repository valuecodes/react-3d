import ReactDOM from 'react-dom'
import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { extend, Canvas, useRender, useThree, useResource, useFrame } from 'react-three-fiber'
import TranformControl from './../../../../utils/other/transformControl'
import FaceNormals from './../../../../utils/helpers/faceNormals'
import VertexNormals from './../../../../utils/helpers/vertexNormals'
import EditVertices from './../../../../utils/edit/v1/editVertices'
import EditFaces from './../../../../utils/edit/v1/editFaces'
import { Vector3, Face3, Face4 } from 'three';
import { func } from 'prop-types';


export default function Box(props) {

  const transform = useRef()
  const { camera, gl } = useThree()
  const [ref, mesh] = useResource()
  const [vertices, setVertices] = useState([]);
  const [faces, setFaces] = useState([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let vertices=ref.current.geometry.vertices.map(ver => ver);
    console.log(ref.current.geometry)
    let faces=computeFaceCentroids(ref.current.geometry)
    setVertices(vertices)
    setFaces(faces);
  },[props])

  // let helper;

  useFrame(() => {
    if(updated){
      ref.current.geometry.verticesNeedUpdate = true; ref.current.geometry.normalsNeedUpdate = true;
      ref.current.geometry.elementsNeedUpdate= true;
      ref.current.geometry.uvsNeedUpdate= true;
      ref.current.geometry.uvsNeedUpdate= true;
      ref.current.geometry.lineDistancesNeedUpdate= true;
     }
   })

   const updateVertices=(newPosition, index)=>{

    let updatedVertices=[...vertices];
    updatedVertices[index]=newPosition;
    ref.current.geometry.vertices[index].x=newPosition.x;
    ref.current.geometry.vertices[index].y=newPosition.y;
    ref.current.geometry.vertices[index].z=newPosition.z;
    setVertices(updatedVertices);
    setUpdated(true);
    let updatedFaces=computeFaceCentroids(ref.current.geometry)
    setFaces(updatedFaces);
   }
   
   const updateFaces=(newPosition,start,startingPosition, index)=>{

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

    ref.current.geometry.vertices[id1].x=xStart1;
    ref.current.geometry.vertices[id2].x=xStart2;
    ref.current.geometry.vertices[id3].x=xStart3;

    ref.current.geometry.vertices[id1].y=yStart1;
    ref.current.geometry.vertices[id2].y=yStart2;
    ref.current.geometry.vertices[id3].y=yStart3;

    ref.current.geometry.vertices[id1].z=zStart1;
    ref.current.geometry.vertices[id2].z=zStart2;
    ref.current.geometry.vertices[id3].z=zStart3;

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
    let updatedFaces=computeFaceCentroids(ref.current.geometry)
    setFaces(updatedFaces);
   }  
  
    return (
        <>
      <mesh ref={ref}
      >
        <boxGeometry attach="geometry" args={[10, 10, 10]} />
        <meshNormalMaterial attach="material" color='white'/>
        {/* <EdgesNormals current={ref.current}/> */}
      {/* <faceNormalsHelper args={[mesh1,3,'red']}/> */}
      {/* <FaceNormals current={ref.current} /> */}
      {/* <VertexNormals setPosition={setPosition} current={ref.current} cube={cube}/> */}
      <EditFaces current={ref.current} faces={faces} updateFaces={updateFaces}/>
      <EditVertices current={ref.current} vertices={vertices} updateVertices={updateVertices}/>
      {/* <RectArea current={ref.current}/> */}
      {/* <edgesGeometry args={[10, 10, 10]}/> */}
      </mesh>
      
      {/* <VertexNormalsHelper args={[[ref.current],4,0x0ff, 2 ]}/> */}
        {/* <vertexNo/> */}
      {/* <TranformControl mesh={mesh}/> */}
      </>
    )
}


function getVertices(faces, index){
  return [faces[index].a,faces[index].b,faces[index].c]
}

function computeFaceCentroids( geometry ) {

  var f, fl, face;
  console.log(geometry)
let cor=[];
  for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

      face = geometry.faces[ f ];
      face.centroid = new THREE.Vector3( 0, 0, 0 );

      if ( face instanceof THREE.Face3 ) {

          face.centroid.add( geometry.vertices[ face.a ] );
          face.centroid.add( geometry.vertices[ face.b ] );
          face.centroid.add( geometry.vertices[ face.c ] );
          face.centroid.divideScalar( 3 );

      } else if ( face instanceof THREE.Face4 ) {

          face.centroid.add( geometry.vertices[ face.a ] );
          face.centroid.add( geometry.vertices[ face.b ] );
          face.centroid.add( geometry.vertices[ face.c ] );
          face.centroid.add( geometry.vertices[ face.d ] );
          face.centroid.divideScalar( 4 );

      }
      cor.push(face.centroid)
  }
  return cor

}