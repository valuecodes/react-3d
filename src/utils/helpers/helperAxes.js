import React from 'react'

export default function HelperAxes({cameraSettings, size}) {
    const {axes}=cameraSettings
    console.log(size)
    if(axes){
        return <axesHelper cameraSettings={cameraSettings}  args={size}/>
    }else return null
}
