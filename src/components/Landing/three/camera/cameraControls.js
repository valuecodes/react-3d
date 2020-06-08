import React from 'react'

export default function CameraControls({changeCameraPosition, changeCameraRotation}) {
    
    const rotate=(deg)=>{
        let rad = deg * (Math.PI/180)
        changeCameraRotation(rad)
    }
    
    return (
        <div className='cameraControls'>
            <button className="initial" onClick={e => changeCameraPosition([0,-90,120])}>Initial</button>
            <button className="bot" onClick={e => changeCameraPosition([0,0,-120])}>Bot</button>
            <button className="top" onClick={e => changeCameraPosition([0,0,120])}>Top</button>
            <button className="left" onClick={e => changeCameraPosition([0,90,0])}>Left</button>
            <button className="right" onClick={e => changeCameraPosition([0,-90,0])}>Right</button>
            <button className="rLeft" onClick={e => rotate(90)}>Rotate left</button>
            <button className="rRight" onClick={e => rotate(-90)}>Rotate right</button>
        </div>
    )
}
