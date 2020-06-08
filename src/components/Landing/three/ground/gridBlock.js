import React,{useRef,useState} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridBlock(props) {

    const mesh = useRef();
    const [color, setColor] = useState('orange')
    const [hover, setHover] = useState(false)
    const [selected, setSelected] = useState(false)
    const [keyDown,setKeyDown] = useState(false)


    const selectBlocks=(e)=>{
        setHover(true)
        if(e.buttons===1){
            setSelected(true)
        }
    }

    console.log(keyDown);
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
        scale={[1.5, 1.5, 1.5] }>
        <boxBufferGeometry attach="geometry" args={[10, 10, hover||selected?5:1]} />
        <meshStandardMaterial attach="material" color={selected?'green':hover?'red':'orange'} />
      </mesh>
    )
}
