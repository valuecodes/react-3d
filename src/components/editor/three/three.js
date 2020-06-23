import React,{useState,useEffect,useRef,useRender} from 'react'
import ReactDOM from 'react-dom'
// import Box from './box'
import Pointer from './pointer'
// import CameraControls from './camera/cameraControls'
import { Canvas, useFrame,useThree} from 'react-three-fiber'

import OrbitControl from './../../../utils/orbit/orbitControl'
import CameraControls from './../../../utils/orbit/cameraControls'
import HelperGrid from './../../../utils/helpers/helperGrid'
import HelperAxes from './../../../utils/helpers/helperAxes'

import CustomBox from './components/box/customBox'


import Circle from './components/circle/circle'

// import TestBox from './../three/components/customBox/testbox'

import Box from './box/box'
import BoxEdit from './box/boxEdit'
import SmoothBox from './box/smoothBox'

import Line from './components/line/line'
import LineLoop from './components/lineLoop/line'
import { useDrag } from "react-use-gesture"


import MazePathFinder from './algorithms/mazeAStar/mazePathFinder'
import Maze from './algorithms/maze/maze'
import AStar from './algorithms/astar/aStar'

import Navigation from './navigation/navigation'

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
        grid:false,
        mode:'orbit'
    })

    const main=useRef();

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
        <div id='canvas' 
            // onMouseMove={(e)=>trackPosition(e)}
            onClick={e => console.log('test')}
            // onKeyDown={e => console.log(e.keyCode)}
            onScroll={e => console.log(e)}
            >
            <Canvas
                camera={{
                    position:[20,100,20]
                }}   
                
            >
                <ambientLight />
                <pointLight 
                    // position={light} 
                    // position={[0,-100,-100]} 
                    position={[0,120,-120]} 
                    />

                <group
                    rotation={cameraSettings.cameraRotation}
                    size={[160,160,160]}
                    position={[0,0,0]}
                    ref={main}
                >
                    
                    {/* <Pointer position={light}/> */}
                    {/* <GroundGrid  orbit={orbit}/> */}
                    <OrbitControl cameraSettings={cameraSettings}/>
                    
                    {/* <Circle position={[10,0,0]}/> */}
                    {/* <Circle position={[0,0,10]}/> */}
                    {/* <Grid shape={{cols:5, rows:5}} /> */}
                    {/* <CustomBox position={[0,5,0]} /> */}
                    {/* <Box position={[0,5,0]} /> */}
                    {/* <BoxEdit/> */}
                    {/* <SmoothBox/> */}
                    
                    {/* <GridRef/> */}

                    <MazePathFinder position={[0,0,0]} size={[20,20]}/>
                    {/* <Maze position={[0,0,0]} size={[20,20]}/> */}
                    {/* <AStar position={[0,0,0]} size={[20,20]}/> */}

                    {/* <Text text={'Testing'}/> */}

                    {/* <Line cameraSettings={cameraSettings}/> */}
                    {/* <LineLoop cameraSettings={cameraSettings}/> */}
                    {/* <TestBox position={[0,5,0]}/> */}
                    <HelperAxes cameraSettings={cameraSettings}  size={[50]}/>
                    <HelperGrid cameraSettings={cameraSettings} size={[200,20]}/>
                </group>

                <pointLight distance={100} intensity={4} color="white" />
                
                {/* {boxes.map(box=>
                    <Box position={box}/>
                )} */}

            </Canvas>
            <Navigation />
            <CameraControls 
                cameraSettings={cameraSettings}
                changeCameraSettings={changeCameraSettings}
            />
        </div>
    )
}
