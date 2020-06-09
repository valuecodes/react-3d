import React,{useRef,useState,useEffect} from 'react'
import { useFrame } from 'react-three-fiber'
import { PlaneGeometry, Vector3, Math, DoubleSide, BufferGeometry } from "three";
import XAxis from './xAxis'
import { element } from 'prop-types';

export default function Vertice(props) {
    const mesh = useRef()
    const [selected, setSelected]=useState(false);

    const [active, setActive] = useState([]);

    // const pos=[[position.x,position.y,position.z]];
    // console.log(pos)


    useFrame(() => {
        // console.log(screenY)
        // if(selected){

        //     mesh.current.position.x++;
        //    console.log(mesh.current.geometry.vertices)
        //  }
       })

    const select=()=>{
        setSelected(!selected)
        selected?setActive([]):setActive([props]);
    }

    return (
        <>
      <mesh
        onClick={e => select()}
        {...props}
        ref={mesh}
        scale={[1,1,1]}>
        <sphereGeometry attach="geometry" args={[1, 10, 10]} />
        <meshStandardMaterial  attach="material" color={selected?'red':'green'} />  
      </mesh>
        {active.map(element =>
            <XAxis position={props} selected={selected} updateX={props.updateX} index={props.index}/>
        )}
      </>
    )
  }