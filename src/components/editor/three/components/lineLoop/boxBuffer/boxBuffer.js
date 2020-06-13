import React,{ useRef, useState, useEffect } from 'react'

export default function BufferBox({points}) {

    const [selected, setSelected]=useState(false)
    console.log('testtte')
    return (
        <>
            <planeBufferGeometry attach="geometry" args={[8,20,1]} />
            <meshBasicMaterial attach="material" color={'green'} />
        </>
    )
}
