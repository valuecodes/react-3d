import React from 'react'

export default function TextBackGround({position}) {
    console.log(position)
    position[1]-=0.1
    return (
        <mesh
            // ref={background}
            position={[0,0,-1]}
            rotate={[-Math.PI/2,0,0]}
            // ref={box}
            // onClick={e => console.log(box)}
        >
            <planeGeometry attach="geometry" args={[80, 10, 2]} />
            <meshBasicMaterial  attach="material" color='gray' transparent={true} side={2} opacity={0.1}/>  
            {/* <MeshEdit current={box}/> */}
        </mesh>
    )
}
