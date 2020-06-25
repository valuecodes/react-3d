import React,{useRef, useEffect} from 'react'
import TextListElement from './textListElement'
import { calculateListPosition }from './../../../other/calculatePosition'
import { disposeElements } from './../../../other/disposeElements'
export default function TextList({ position,list,size, listMesh, addListMesh, renderer }) {
    
    const mesh=useRef();

    if(listMesh===null&&mesh.current!==undefined){
        addListMesh(mesh.current.children)
    }

    useEffect(()=>{
        return () => disposeElements(mesh.current, renderer)
    },[])

    return (
        <mesh
            ref={mesh}
            name={'list'}
        >
            {list.map((elem, index)=>
                <TextListElement text={elem} position={calculateListPosition(size,position,index)}
                renderer={renderer}
                />
            )}            
        </mesh>
    )
}
