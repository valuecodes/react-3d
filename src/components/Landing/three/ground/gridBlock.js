import React,{useRef,useState} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridBlock(props) {

    const mesh = useRef();
    const [color, setColor] = useState('orange')
    const [hover, setHover] = useState(false)
    const [selected, setSelected] = useState(false)

    return (
        <mesh
        onClick={e => setSelected(!selected)}
        onPointerOver={e => setHover(true)}
        onPointerOut={e => setHover(false)}
        {...props}
        ref={mesh}
        scale={[1.5, 1.5, 1.5] }>
        <boxBufferGeometry attach="geometry" args={[10, 10, hover||selected?5:1]} />
        <meshStandardMaterial attach="material" color={selected?'green':hover?'blue':'orange'} />
      </mesh>
    )
}
