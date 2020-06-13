import React,{useRef, useState, useEffect} from 'react'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { extend, Canvas, useRender, useThree, useResource } from 'react-three-fiber'
extend({ VertexNormalsHelper })

export default function VertexNormals({current, setPosition}) {
    const helper=useRef();
    if(current){
        
    return (
        <vertexNormalsHelper
        ref={helper} 
        args={[current,3,'red']}
        /> 
    )        
    }else return null;

}
