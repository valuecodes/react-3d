import React,{useRef,useState,useEffect} from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ReactDOM from 'react-dom'
import { extend, useThree, useFrame } from 'react-three-fiber'
extend({ OrbitControls })

export default function OrbitControlPanel({orbit,cameraPosition}) {

    const cameraRef =useRef();
    const [cameraPos, setCameraPos]=useState([0,0,120])
    const [buttonClick, setButtonClick] =useState(false);
    const {
        camera,
        gl: { domElement }
    } = useThree()


    useEffect(()=>{

        // camera.position.set(cameraPosition);
        // cameraRef.current.update();

        setCameraPos(cameraPosition)
        setButtonClick(true);

    },[cameraPosition])

        // Camera


    useFrame(() => {
        if(buttonClick){

            if (camera.position.x<cameraPos[0]) {
                camera.position.x+=3
            }
            if (camera.position.x>cameraPos[0]) {
                camera.position.x-=3
            }

            if (camera.position.y<cameraPos[1]) {
                camera.position.y+=3
            }
            if (camera.position.y>cameraPos[1]) {
                camera.position.y-=3
            }

            if (camera.position.z<cameraPos[2]) {
                camera.position.z+=3
            }
            if (camera.position.z>cameraPos[2]) {
                camera.position.z-=3
            }
            cameraRef.current.update();

            if(
                Math.abs(cameraPos[0]-camera.position.x)<=3 && 
                Math.abs(cameraPos[1]-camera.position.y)<=3 && 
                Math.abs(cameraPos[2]-camera.position.z)<=3 
            ){
                setButtonClick(false)
            }
        }

      })

    return (
        <orbitControls 
            ref={cameraRef} 
            args={[camera, domElement]}
            enabled = {orbit}
            enablePan = {false}
        />
    )
}
