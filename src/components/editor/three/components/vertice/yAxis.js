import React,{useRef,useState,useEffect} from 'react'
import { useFrame } from 'react-three-fiber'
import { PlaneGeometry, Vector3, Math, DoubleSide, BufferGeometry } from "three";


export default function YAxis({position, selected, updateY,index}) {
    const mesh = useRef()

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos]=useState({ x: 0, y: 0 })
    const [active, setActive]=useState(false)

    useEffect(() => {
      const setFromEvent = e => setPos({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", setFromEvent);
  
      return () => {
        window.removeEventListener("mousemove", setFromEvent);
      };
    }, []);

    const startDrag=(e)=>{
        setActive(!active)
        setInitialPos(e.clientY)
    }

    useFrame(() => {
        
        if(active){
            mesh.current.position.y=pos.y-initialPos
            updateY(pos.y-initialPos,index);
         }
       })
        return (
            <>
        <mesh
            onClick={e => startDrag(e)}
            drag={e => console.log(e.target.value)}
            {...position}
            ref={mesh}
            scale={[1,1,1]}>
            
            <boxGeometry attach="geometry" args={active?[0.1,1000,1000]:[1, 20, 1]} />
            <meshStandardMaterial  attach="material" opacity={active?0:1} color={'orange'} transparent/>
        </mesh>  
        </>
        )         
        
  }