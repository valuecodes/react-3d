import React,{useRef} from 'react'
import { useFrame } from 'react-three-fiber'

export default function Ground(props) {
    const mesh = useRef()
    return (
        <mesh
        {...props}
        ref={mesh}
        // rotation={[-45,0,0]}
        scale={[2, 2, 2]}>
        <boxBufferGeometry attach="geometry" args={[200, 180, 1]} />
        <meshStandardMaterial attach="material" color={'gray'} />
      </mesh>
    )
}
