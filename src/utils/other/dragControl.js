import React,{useRef, useState, useEffect} from 'react'
import * as THREE from 'three'
import ReactDOM from 'react-dom'
import { Canvas, extend, useThree } from 'react-three-fiber'
import { Vector3 } from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'


extend({ DragControls })

export default function DragControl({current}) {
    const mesh=useRef();
    const [arrows, setArrows]=useState([]);

    useEffect(()=>{
        let dir=[
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Vector3( -Math.PI/2,0,0),
            new THREE.Vector3( 0,0,Math.PI/2),
        ];
        let origin=new THREE.Vector3( 0, 0, 0 );
        let length = 10;
        var hex = 0xffff00;
        let newArrows=[];
        for(var i=0;i<3;i++){
            newArrows.push({
                dir:dir[i],
                origin:origin,
                length:length,
                hex:hex
            })
        }
        setArrows(newArrows)
    },[])

    const {
        camera,
        gl: { domElement }
    } = useThree()
    
    if(current){
        return (
            <mesh
            ref={mesh}
            >
                <transformControls ref={current} args={[camera, domElement]} onUpdate={self => self.attach(current)} />}
            </mesh>
            
        )
    }else return null;

  }