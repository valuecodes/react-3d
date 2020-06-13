import React,{useRef} from 'react'
import { FaceNormalsHelper } from 'three/examples/jsm/helpers/FaceNormalsHelper'
import { extend, Canvas, useRender, useThree, useResource, useFrame } from 'react-three-fiber'
extend({ FaceNormalsHelper })

export default function FaceNormals({current}) {
    console.log(current)

    const helper=useRef();
    useFrame(() => {

          helper.current.geometry.verticesNeedUpdate = true; helper.current.geometry.normalsNeedUpdate = true;
          helper.current.geometry.elementsNeedUpdate= true;
          helper.current.geometry.uvsNeedUpdate= true;
          helper.current.geometry.uvsNeedUpdate= true;
          helper.current.geometry.lineDistancesNeedUpdate= true;

       })

    if(current){
    return (
        <faceNormalsHelper
        ref={helper} 
        onClick={e => console.log(helper.current)}
        args={[current,3,'red']}
        /> 
    )        
    }else return null;

}
