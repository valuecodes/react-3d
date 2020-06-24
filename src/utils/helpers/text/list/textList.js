import React,{useRef} from 'react'
import TextListElement from './textListElement'
import { calculateListPosition }from './../../../other/calculatePosition'

export default function TextList({ position,list,size, listMesh, addListMesh }) {
    
    const mesh=useRef();

    if(listMesh===null&&mesh.current!==undefined){
        addListMesh(mesh.current.children)
    }

    return (
        <mesh
            ref={mesh}
            name={'list'}
        >
            {list.map((elem, index)=>
                <TextListElement text={elem} position={calculateListPosition(size,position,index)}/>
            )}            
        </mesh>
    )
}
