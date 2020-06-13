import React,{ useState, useRef, useEffect } from 'react'
import TransformControl from './transformControl'
import { useResource, useFrame } from 'react-three-fiber'

export default function DragPoint(props) {


    return (
        <>
        <mesh

            {...props}

            scale={[1,1,1]}>
            <boxGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial  attach="material" 
            color={'black'} 
            />  
            
      </mesh>
      {/* <TransformControl mesh={mesh} selected={selected}/> */}
      </>
    )
}
