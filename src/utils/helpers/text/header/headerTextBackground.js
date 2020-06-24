import React from 'react'

export default function HeaderTextBackGround({position, text}) {
    position[1]-=0.1
    return (
        <mesh
            position={[55,0,-1]}
            rotate={[-Math.PI/2,0,0]}
        >
            <planeGeometry attach="geometry" args={[120, 20, 2]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.1}/>  
        </mesh>
    )
}
