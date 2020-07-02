import React from 'react'

export default function PathLine({pathLine,options}) {
    return (
        <line
            ref={pathLine}
        >
            <bufferGeometry attach="geometry"/>
            <lineBasicMaterial attach="material" color={options.colorScheme.pathLine} side={2}/>
        </line>
    )
}
