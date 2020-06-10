import React,{useRef,useState} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridBlock(props) {

    const {orbit}=props

    const mesh = useRef();
    const [color, setColor] = useState('orange')
    const [hover, setHover] = useState(false)
    const [selected, setSelected] = useState(false)
    const [keyDown,setKeyDown] = useState(false)


    const selectBlocks=(e)=>{
        setHover(true)
        if(e.buttons===1 && !orbit){
            setSelected(true)
        }
    }

    useFrame(() => {
        // if (hovered && !active) {
        //   mesh.current.rotation.z += 0.01
        //   mesh.current.rotation.x += 0.01
        // }
        // if (hovered && active) {
        //   mesh.current.rotation.y += 0.02
        //   mesh.current.rotation.x += 0.06
        // }
      })

    return (
        <mesh
        onClick={e => 
            setSelected(!selected)
        }
        onPointerOver={e => selectBlocks(e)}
        onPointerOut={e => setHover(false)}
        onKeyDown={e => setKeyDown(true)}

        {...props}
        ref={mesh}
        rotate={[30,30,30]}
        // scale={[1, 1.5, 1.5] }
        >
        <boxBufferGeometry attach="geometry" args={[9, 9, hover||selected?5:1]} />
        <meshStandardMaterial attach="material" color={selected?'green':hover?'red':'orange'} />
      </mesh>
    )
}
