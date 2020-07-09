import React from 'react'

export default function PathLine({pathLine,options}) {
    return (
        <lineSegments
            ref={pathLine}
        >
            <edgesGeometry attach="geometry"/>
            <lineBasicMaterial attach="material" color={'red'} />
        </lineSegments>
    )
}
