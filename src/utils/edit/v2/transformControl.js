import React, { useRef, useEffect } from 'react'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { extend, Canvas,  useRender, useThree, useResource } from 'react-three-fiber'

extend({ TransformControls })

export default function TransformControl({mesh, selected}) {

    const transform = useRef()
    const { camera, gl } = useThree()
    console.log(mesh)
    if(selected){
        return (     
            <transformControls 
                ref={transform} 
                args={[camera, gl.domElement]} 
                onUpdate={self => self.attach(mesh)} 
            />
        )        
    }else return null

}
