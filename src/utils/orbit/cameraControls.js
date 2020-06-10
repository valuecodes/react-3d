import React from 'react'
import {useSpring, animated} from 'react-spring'
export default function CameraControls({cameraSettings, changeCameraSettings}) {
    
    const {
        cameraRotation,
        orbit,
        grid,
        axes
    } = cameraSettings

    const rotate=(deg)=>{
        let newRotation = [...cameraRotation];
        let rad = deg * (Math.PI/180)
        newRotation[1]=newRotation[1]+rad;
        changeCameraSettings('cameraRotation',newRotation)
    }

    const test = useSpring({opacity: orbit ? 1 : 0})
    
    return (
        <div className='cameraControls'>
        <animated.div style={test}>i will fade</animated.div>
            <button className="initial" onClick={e => changeCameraSettings('cameraPosition',[0,90,120])}>Initial</button>
            <button className="back" onClick={e => changeCameraSettings('cameraPosition',[0,0,-120])}>Back</button>
            <button className="front" onClick={e => changeCameraSettings('cameraPosition',[0,0,120])}>Front</button>
            <button className="top" onClick={e => changeCameraSettings('cameraPosition',[0,90,0])}>Top</button>
            <button className="bot" onClick={e => changeCameraSettings('cameraPosition',[0,-90,0])}>Bot</button>
            <button className="rLeft" onClick={e => rotate(90)}>Rotate left</button>
            <button className="rRight" onClick={e => rotate(-90)}>Rotate right</button>
            <button onClick={e => changeCameraSettings('orbit',!orbit)}>{`Orbit Controlls ${orbit}`}</button>
            <button onClick={e => changeCameraSettings('grid',!grid)} className='grid'>Grid</button>
            <button onClick={e => changeCameraSettings('axes',!axes)} className='axes' >Axes</button>
            {/* <input onChange={e => rotate(-1)} className="range" type='range'/> */}
        </div>
    )
}
