import React,{useRef,useState,useEffect} from 'react'
import { useFrame } from 'react-three-fiber'

export default function GridBlock(props) {

    const {orbit,spot}=props

    const mesh = useRef();
    const [color, setColor] = useState('orange')
    const [hover, setHover] = useState(false)
    const [selected, setSelected] = useState(false)
    const [keyDown,setKeyDown] = useState(false)


    useEffect(() => {
        // console.log(spot.color)
        if(spot.wall){
            setSelected(true);
            setColor('gray')
        }else{
            setColor(spot.color)
        }
    }, [spot.color])
// console.log(props)
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

        {...props}
        ref={mesh}
        rotate={[30,30,30]}
        // scale={[1, 1.5, 1.5] }
        >
        <boxBufferGeometry attach="geometry" args={[5,2,5 ]} />
        <meshStandardMaterial attach="material" color={color} />
      </mesh>
    )
}
