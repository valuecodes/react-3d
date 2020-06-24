import React from 'react'

export default function TextBackGround({position}) {

    position[1]-=0.1
    
    function hoverColor(e,dir){
        if(dir==='in') e.object.material.color.set('green')
        if(dir==='out') e.object.material.color.set('gray')
    }

    return (
        <mesh
            onPointerOver={e => hoverColor(e,'in')}
            onPointerOut={e => hoverColor(e,'out')}
            position={[0,0,-1]}
            rotate={[-Math.PI/2,0,0]}
        >
            <planeGeometry attach="geometry" args={[80, 10, 2]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.4}/>  
        </mesh>
    )
}
