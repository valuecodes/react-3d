import React,{useState,useEffect,useRef,useRender} from 'react'
import ReactDOM from 'react-dom'


import { Canvas, useFrame,useThree} from 'react-three-fiber'

import OrbitControl from './../../../utils/orbit/orbitControl'
import CameraControls from './../../../utils/orbit/cameraControls'
import HelperGrid from './../../../utils/helpers/helperGrid'
import HelperAxes from './../../../utils/helpers/helperAxes'


// import MazePathFinder from './algorithms/mazeAStar/mazePathFinder'
// import Maze from './algorithms/maze/maze'
// import AStar from './algorithms/astar/astar'
import CubeMaze from './algorithms/cubemaze/cubemaze'
import CubeMaze2 from './algorithms/cubeMaze2/cubemaze2'
import CubeAstar from './algorithms/cubeAstar/cubeastar'
import CubeMazePathfinder from './algorithms/cubeMazePathfinder/cubeMazePathfinder'


import Navigation from './navigation/navigation'

import { useSpring, useTransition, animated, config } from 'react-spring/three'
import { WebGLRenderer } from 'three';

export default function Three() {

    const [light,setLight]=useState([25,50,50]);
    const [position, setPosition] = useState(0);
    const renderer=useRef()

    const [cameraSettings, setCameraSettings]=useState({
        cameraPosition:[0,70,100],
        cameraRotation:[0.5,0,0],
        orbit:true,
        axes:false,
        grid:false,
        mode:'orbit'
    })

    const [scene, setScene] = useState([        
        <CubeMazePathfinder position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
        <CubeAstar position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
        // <CubeMaze2 position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
        // <CubeMaze position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,

        // <Maze position={[0,0,0]} size={[20,20]} renderer={renderer}/>,
        // <MazePathFinder position={[0,0,0]} size={[20,20]} renderer={renderer}/>,
        // <AStar position={[0,0,0]} size={[30,30]} renderer={renderer}/>
    ])

    const main=useRef();
    




    const trackPosition=(e)=>{
        setLight([e.clientX-window.innerWidth/2 ,(e.clientY-window.innerHeight/2)*-1,-150])
    }

    const changeCameraSettings=(option,newValue)=>{
        let updatedSettings={...cameraSettings}
        updatedSettings[option]=newValue;
        setCameraSettings(updatedSettings)
    }

    const changePosition=(button)=>{
        let dir=0;
        if( button === 'Last' && position > 0 ) dir = -1;
        if( button === 'Next' && position < 3) dir = 1
        let newPos=position+dir
        // main.current.children[position].geometry.dispose();
        // main.current.children[position].material.dispose();
        // main.current.remove(main.current.children[position])
        
        setPosition(newPos);
    }

    return (
        <div id='canvas' 
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
                    position={[100,100,-100]} 
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

                    {scene.map((elem,index)=>{
                        if(index===position){
                            return elem
                        }
                    })}

                    <webGLRenderer antialias={true} ref={renderer}/>
                </group>

            </Canvas>
            <Navigation changePosition={changePosition}/>
            <CameraControls 
                cameraSettings={cameraSettings}
                changeCameraSettings={changeCameraSettings}
            />
        </div>
    )
}
