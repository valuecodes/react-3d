import React,{useRef,useEffect} from 'react'
import * as THREE from 'three'
import { useFrame } from 'react-three-fiber'
// const geometry = new THREE.BoxGeometry(10, 10, 10);
// const edges = new THREE.EdgesGeometry(geometry);

// const edgesMaterial = new THREE.LineBasicMaterial({
//     color: 0xff0000
//   });
//   const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);

export default function Edges({current}) {

    const line=useRef();

    useEffect(()=>{

    },[current])

    useFrame(() => {
        if(line){
            // console.log(line.current)
            // line.current.matrixWorldNeedsUpdate = true;
            // line.current.geometry.parent.geometry.normalsNeedUpdate = true;  
         }
       })


    console.log(current)
    if(current.current){
        return (
            <>
                <lineSegments
                    ref={line}
                    onClick={e => console.log(line)}
                >
                    <edgesGeometry attach="geometry" args={[current.current.geometry]}/>
                    <lineBasicMaterial attach="material" color={'red'}/>
                {/* <primitive object={edgesMesh}/> */}
                {/* <edgesGeometry args={[geometry]} />  */}

                </lineSegments>

            </>
            
        )        
    }else return null;

}
