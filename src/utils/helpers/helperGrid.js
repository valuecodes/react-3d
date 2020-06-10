import React from 'react'

export default function HelperGrid({cameraSettings, size}) {
    const {grid}=cameraSettings
    if(grid){
        return <gridHelper args={size} />
    }else return null
}
