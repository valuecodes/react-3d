import React from 'react'

export default function CameraControls({changeCameraPosition}) {
    return (
        <div className='cameraControls'>
            <button onClick={e => changeCameraPosition([0,-90,120])}>Top</button>
        </div>
    )
}
