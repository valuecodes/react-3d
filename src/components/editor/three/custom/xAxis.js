import React,{useRef,useState,useEffect} from 'react'
import { useFrame } from 'react-three-fiber'
import { PlaneGeometry, Vector3, Math, DoubleSide, BufferGeometry } from "three";


export default function XAxis({position, selected, updateX,index}) {
    const mesh = useRef()

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos]=useState({ x: 0, y: 0 })
    const [active, setActive]=useState(false)

    useEffect(()=>{
        // setInitialPos(position)
    },[position])

    useEffect(() => {
      const setFromEvent = e => setPos({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", setFromEvent);
  
      return () => {
        window.removeEventListener("mousemove", setFromEvent);
      };
    }, []);

    // const pos=[[position.x,position.y,position.z]];

    const startDrag=(e)=>{
        console.log(e.screenX)
        // setInitialPos()
        setActive(!active)
        setInitialPos(e.clientX)
    }

    var length = 10;
    var hex = 0xffff00;

    useFrame(() => {
        
        if(active){
            // console.log(initialPos)
            mesh.current.position.x=pos.x-initialPos
            updateX(pos.x-initialPos,index);
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
            
            <boxGeometry attach="geometry" args={active?[1000,0.1,1000]:[20, 1, 1]} />
            <meshStandardMaterial  attach="material" opacity={active?0:1} color={'orange'} transparent/>
        </mesh>  
        </>
        )         
        
  }