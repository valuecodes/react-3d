import React,{useRef} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridColumn(props) {
    // useFrame(() => {
        // if (hovered && !active) {
        //   mesh.current.rotation.z =20
        //   mesh.current.rotation.x += 0.001
        // }
        // if (hovered && active) {
        //   mesh.current.rotation.y += 0.002
        //   mesh.current.rotation.x += 0.006
        // }
    //   })
    const mesh = useRef()
    return (
        <mesh
        {...props}
        ref={mesh}
        // rotation={[250,0,0]}
        scale={[2, 2, 2]}>
        <boxBufferGeometry attach="geometry" args={[1, 10000, 1]} />
        <meshStandardMaterial attach="material" color={'gray'} />
      </mesh>
    )
}
