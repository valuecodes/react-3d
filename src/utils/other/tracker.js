import React,{ useRef} from 'react'
import { useFrame  } from 'react-three-fiber'
export default function Tracker({position}) {

    const mesh=useRef();
    useFrame(() => {
        if(mesh.current){
            mesh.current.position.x=position[0]
            mesh.current.position.z=position[1]
        }
      })

    return (
        <mesh
        ref={mesh}
        scale={[2,2,2]}>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshStandardMaterial attach="material" color={'orange'} />
        </mesh>
    )
}
