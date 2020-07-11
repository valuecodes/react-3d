import React,{useState,useRef,useContext} from 'react'
import { Canvas } from 'react-three-fiber'

import OrbitControl from './../../../utils/orbit/orbitControl'
import CameraControls from './../../../utils/orbit/cameraControls'
// import HelperGrid from './../../../utils/helpers/helperGrid'
// import HelperAxes from './../../../utils/helpers/helperAxes'


// import MazePathFinder from './algorithms/mazeAStar/mazePathFinder'
// import Maze from './algorithms/maze/maze'
// import AStar from './algorithms/astar/astar'
// import CubeMaze from './algorithms/cubeMaze/cubemaze'
// import CubeAstar from './algorithms/cubeAstar/cubeastar'
// import CubeMazePathfinder from './algorithms/cubeMazePathfinder/cubeMazePathfinder'

import HexaSphereMaze from './algorithms/hexasphere/hexaSphereMaze'
import HexaSpherePathfinder from './algorithms/hexasphere/hexaSpherePathfinder'
import HexaMazePathfinder from './algorithms/hexasphere/hexaMazePathfinder'
import HexaSphere from './algorithms/hexasphere/hexaSphere'

// import Instancing from './instancing'
// import Instance from './instance/app'

import Navigation from './navigation/navigation'

import { GlobalOptions } from '../../../context/GlobalOptions'

export default function Three() {

    const {options,modifyOptions}=useContext(GlobalOptions);

    const [light,setLight]=useState([25,50,50]);
    const [position, setPosition] = useState(0);
    // const renderer=useRef()

    const [cameraSettings, setCameraSettings]=useState({
        cameraPosition:[0,90,120],
        cameraRotation:[0.6,0,0],
        orbit:true,
        axes:false,
        grid:false,
        mode:'orbit'
    })

    const [scene, setScene] = useState([        
        // <HexaSphereMaze/>,
        <HexaSpherePathfinder/>,
        // <HexaMazePathfinder/>
        // <CubeMazePathfinder position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
        // <CubeAstar position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
        // <CubeMaze position={[0,0,0]} size={[10,10]} renderer={renderer} cameraSettings={cameraSettings}/>,
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
        <div 
            id='three'
            >
            <Canvas
                id='canvas' 
                onDoubleClick={e => modifyOptions('Mode','Rotate')}
                camera={{
                    // position:[20,50,20]
                }}   
                
            >
                {/* <directionalLight
                    position={[200,200,200]}
                    castShadow={false}
                /> */}

                <ambientLight />
                {/* <pointLight 
                    position={[250,250,250]} 
                /> */}

                <group
                    rotation={cameraSettings.cameraRotation}
                    size={[160,160,160]}
                    position={[2,2,2]}
                    ref={main}
                >
                    
                    {/* <Pointer position={light}/> */}
                    {/* <GroundGrid  orbit={orbit}/> */}
                    <OrbitControl cameraSettings={cameraSettings} options={options}/>

                    {/* {scene.map((elem,index)=>{
                        if(index===position){
                            return elem
                        }
                    })} */}
                    <HexaSphere options={options} modifyOptions={modifyOptions}/>
                    

                    {/* <Instancing main={main}/> */}
                    {/* <Instance/> */}
                    {/* <HexaMazePathfinder/> */}
                    {/* <HexaSpherePathfinder/> */}
                     {/* <HexaSphereMaze renderer={renderer}/> */}
                    {/* <webGLRenderer antialias={true} ref={renderer}/> */}
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
