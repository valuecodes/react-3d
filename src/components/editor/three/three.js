import React,{useState,useEffect,useRef,useRender} from 'react'
import ReactDOM from 'react-dom'
import Box from './box'
import Pointer from './pointer'
// import Grid from './grid/grid'
import Ground from './ground/ground'
import GroundGrid from './ground/groundGrid'
// import CameraControls from './camera/cameraControls'
import { Canvas, useFrame,useThree} from 'react-three-fiber'

import OrbitControl from './../../../utils/orbit/orbitControl'
import CameraControls from './../../../utils/orbit/cameraControls'
import HelperGrid from './../../../utils/helpers/helperGrid'
import HelperAxes from './../../../utils/helpers/helperAxes'

import CustomBox from './components/box/customBox'
import AStar from './ground/pathFinding/aStar'
import Grid from './ground/customGrid/grid'

import Line from './components/line/line'


import { useSpring, useTransition, animated, config } from 'react-spring/three'

export default function Three() {

    const [light,setLight]=useState([25,-10,-250]);
    const [boxes,setBoxes]=useState([]);
    const [gridRow,setGridRow]=useState([]);
    const [gridColumn,setGridColumn]=useState([]);

    const [cameraSettings, setCameraSettings]=useState({
        cameraPosition:[0,90,120],
        cameraRotation:[0,0,0],
        orbit:true,
        axes:false,
        grid:true,
        mode:'orbit'
    })

    useEffect(()=>{
        let newGridRow=[];
        for(var i=200;i>-400;i-=20){
            newGridRow.push([0,i,-250]);
        }
        setGridRow(newGridRow)
    },[]);

    const addBox=(e)=>{
        setBoxes([...boxes,[e.clientX-900,(e.clientY-400)*-1,-250]])
    }

    const trackPosition=(e)=>{
        setLight([e.clientX-window.innerWidth/2 ,(e.clientY-window.innerHeight/2)*-1,-150])
    }

    const changeCameraSettings=(option,newValue)=>{
        let updatedSettings={...cameraSettings}
        updatedSettings[option]=newValue;
        setCameraSettings(updatedSettings)
    }

    return (
        <div className='canvas' 
            // onMouseMove={(e)=>trackPosition(e)}
            // onClick={addBox}
            onScroll={e => console.log(e)}
            >
            <Canvas
                camera={{
                    position:[0,0,120]
                }}   
            >
                <ambientLight />
                <pointLight 
                    // position={light} 
                    // position={[0,-100,-100]} 
                    position={[0,0,120]} 
                    />

                <group
                    rotation={cameraSettings.cameraRotation}
                    size={[160,160,160]}
                    position={[0,0,0]}
                >
                    
                    {/* <Pointer position={light}/> */}
                    {/* <GroundGrid  orbit={orbit}/> */}
                    <OrbitControl cameraSettings={cameraSettings}/>
                    {/* <AStar/> */}
                    {/* <Grid shape={{cols:5, rows:5}} /> */}
                    {/* <CustomBox position={[0,5,0]} /> */}
                    <Line cameraSettings={cameraSettings}/>
                    <HelperAxes cameraSettings={cameraSettings}  size={[50]}/>
                    <HelperGrid cameraSettings={cameraSettings} size={[200,20]}/>
                </group>

                <pointLight distance={100} intensity={4} color="white" />
                
                {/* {boxes.map(box=>
                    <Box position={box}/>
                )} */}

            </Canvas>

            <CameraControls 
                cameraSettings={cameraSettings}
                changeCameraSettings={changeCameraSettings}
            />
        </div>
    )
}
