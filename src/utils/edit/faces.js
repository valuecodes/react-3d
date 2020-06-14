import React,{ useRef, useState } from 'react'
import * as THREE from 'three'
import { extend, Canvas, useRender, useThree, useResource, useFrame } from 'react-three-fiber'
import DragPoint from './dragPoint'

export default function Faces({current, faceCentroids, selectFace, selectedFace, updateFaces}) {

    if(current.current){

        let { 
            vertices, 
            faces
        }=current.current.geometry

        let meshes= faces.map((face,index)=>{
            let geom = new THREE.Geometry();
            geom.vertices=[vertices[face.a],vertices[face.b],vertices[face.c]]
            geom.faces.push(new THREE.Face3(0,1,2))
            geom.computeFaceNormals()
            let color=selectedFace===index?"#63c263":"rgb(179, 181, 179)" 
            return new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ color:color }))
        }) 

        return (
            <>  
                {meshes.map((face, index)=>
                    <Face face={face} index={index} selectFace={selectFace} selectedFace={selectedFace}/>
                )}

                {faceCentroids.map((position,index)=>
                    <DragPoint 
                        updateFaces={updateFaces} 
                        current={current.current} 
                        position={Object.values(position)} 
                        key={index} 
                        index={index}
                        selectedFace={selectedFace}
                    />
                )}
            </>
        )        
    }else return null

}

function Face({face, index, selectFace, selectedFace}){

    function setColor(type){
        let color;
        if(index===selectedFace){   
            color='#63c263'
        }else if(type==='in'){
            color='rgb(203, 222, 200)'
        }else{
            color='rgb(179, 181, 179)'
        }
        face.material.color.set(color)
    }

    return (
        <primitive
            onPointerOver={e => setColor('in')}
            onPointerOut={e => setColor('out')}
            onClick={e => selectFace(index)}
            object={face}
        />
    )  
}