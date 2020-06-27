import React,{useRef, useState, useEffect} from 'react'
import * as THREE from 'three'
import ReactDOM from 'react-dom'
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber'
import { Vector3 } from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'

extend({ DragControls })

export default function DragControl({current, updateSliderValue}) {
    const mesh=useRef()
    let currentPosition=useRef();
    const {
        camera,
        gl: { domElement }
      } = useThree()


      useFrame(()=>{
          if(current&&currentPosition.current!==current.position.x){
                if(current.position.x<-10) current.position.x = -10
                if(current.position.x>40) current.position.x = 40
                let cubeSize=Math.ceil((((current.position.x+10)/9)+5))
                updateSliderValue(cubeSize);
                current.position.z=0;
                current.position.y=0;
                currentPosition.current=current.position.x
          }
      })

    if(current){

        return (
            <dragControls 
                ref={mesh} 
                args={[[current], camera, domElement]}
            />
            
        )
    }else return null;

  }