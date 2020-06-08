import React,{useRef,useState} from 'react'
import { useFrame } from 'react-three-fiber'

export default function Box(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef()
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
  
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
      if (hovered && !active) {
        mesh.current.rotation.z += 0.01
        mesh.current.rotation.x += 0.01
      }
      if (hovered && active) {
        mesh.current.rotation.y += 0.02
        mesh.current.rotation.x += 0.06
      }
    })
  
    return (
      <mesh
        {...props}
        ref={mesh}
        scale={active ? [1.5, 1.5, 1.5] : [2, 2, 2]}
        onClick={e => setActive(!active)}
        onPointerOver={e => setHover(true)}
        onPointerOut={e => setHover(false)}>
        <boxBufferGeometry attach="geometry" args={[10, 10, 100]} />
        <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
    )
  }