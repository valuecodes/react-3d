import React,{useRef} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridRow(props) {
    const mesh = useRef()
    return (
        <mesh
        {...props}
        ref={mesh}
        // rotation={[50,100,100]}
        scale={[2, 2, 2]}>
        <boxBufferGeometry attach="geometry" args={[1000, -1, 1]} />
        <meshStandardMaterial attach="material" color={'gray'} />
      </mesh>
    )
}
