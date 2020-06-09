import React,{useRef} from 'react'
import { useFrame } from 'react-three-fiber'

export default function Pointer(props) {
    // console.log(props);
    const mesh = useRef()
    return (
        <mesh
        {...props}
        ref={mesh}
        scale={[2, 2, 2]}
        // onClick={e => setActive(!active)}
        // onPointerOver={e => setHover(true)}
        // onPointerOut={e => setHover(false)}
        >
        <boxBufferGeometry attach="geometry" args={[10, 10, 10]} />
        <meshStandardMaterial attach="material" color={'red'} />
      </mesh>
    )
}
