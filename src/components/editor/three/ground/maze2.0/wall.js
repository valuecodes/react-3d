import React from 'react'

export default function Wall({position,geometry}) {

    return (
            <mesh
                position={position} 
                scale={[1, 1, 1]}
            >
                <boxBufferGeometry attach="geometry" args={geometry} />
                <meshStandardMaterial attach="material" color={'gray'} />
        </mesh>
    )
}
