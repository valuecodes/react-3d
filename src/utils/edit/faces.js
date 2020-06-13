import React,{ useRef, useState } from 'react'
import * as THREE from 'three'
import { extend, Canvas, useRender, useThree, useResource, useFrame } from 'react-three-fiber'
import { element } from 'prop-types';



// let v=

export default function Faces({current, faces, selectFace, selectedFace}) {
    if(current.current){

        let { vertices, faces }=current.current.geometry

        let meshes= faces.map((face,index)=>{
            let geom = new THREE.Geometry();
            geom.vertices=[vertices[face.a],vertices[face.b],vertices[face.c]]
            geom.faces.push(new THREE.Face3(0,1,2))
            geom.computeFaceNormals()
            console.log(selectedFace)
            let color=selectedFace===index?"green":"peachpuff" 
            return new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ color:color }))
        }) 

        return (
            <>  
                {meshes.map((face, index)=>
                    <Face face={face} index={index} selectFace={selectFace}/>
                )}
            </>
        )        
    }else return null

}

function Face({face, index, selectFace}){
    return (
        <primitive
            onClick={e => selectFace(index)}
            object={face}
        />
    )  
}