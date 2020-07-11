import React,{useRef,useState,useEffect} from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ReactDOM from 'react-dom'
import { extend, useThree, useFrame } from 'react-three-fiber'
import {useSpring, animated} from 'react-spring'
import { element } from 'prop-types';

extend({ OrbitControls })

export default function OrbitControlPanel({cameraSettings,options}) {

    const {cameraPosition, orbit}=cameraSettings
    const cameraRef =useRef();
    const [buttonClick, setButtonClick] =useState(false);
    const {
        camera,
        gl: { domElement }
    } = useThree()


    // useEffect(()=>{
    //     setCameraPos(cameraPosition)
    //     setButtonClick(true);
    // },[cameraPosition])

    useEffect(()=>{
        updateCameraPosition([0,70,100])
        cameraRef.current.currentPosition=[0,70,100]
    },[])


    useEffect(()=>{
        
        if(options.Position==='Outside'){
            // updateCameraPosition(cameraRef.current.currentPosition)
        }
        if(options.Position==='Inside'){
            updateCameraPosition([1,1,1])
        }
    },[options])

        // Camera

    useFrame(()=>{        
        if(options.Mode==='Rotate'){
            if(Object.values(camera.position).some(item => Math.abs(item>2))){
                cameraRef.current.currentPosition=Object.values(camera.position)
            }
        }
        
    })

    function updateCameraPosition(cameraPos){
        camera.position.x=cameraPos[0]
        camera.position.y=cameraPos[1]
        camera.position.z=cameraPos[2]
        cameraRef.current.update();
    }

    return (
        <orbitControls 
            ref={cameraRef} 
            args={[camera, domElement]}
            enablePan = {false}
        />
    )
}
