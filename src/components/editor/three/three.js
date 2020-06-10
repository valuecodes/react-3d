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
import CustomBox from './custom/customBox'
import AStar from './ground/pathFinding/aStar'
import Grid from './ground/customGrid/grid'


import { useSpring, useTransition, animated, config } from 'react-spring/three'

export default function Three() {

    const [light,setLight]=useState([25,-10,-250]);
    const [boxes,setBoxes]=useState([]);
    const [gridRow,setGridRow]=useState([]);
    const [gridColumn,setGridColumn]=useState([]);

    const [cameraPosition, setCameraPosition]=useState([0,-90,120]);
    const [cameraRotation, setCameraRotation]=useState([0,0,0]);
    const [orbit, setOrbit]=useState(true);

    // const [{ rotation }, setCameraRotation] = useSpring(() => ({
    //     rotation: [0, 0, 0],
    //     config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
    //   }))

      

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

    const changeCameraPosition=(newPosition)=>{
        setCameraPosition(newPosition)
    }

    const changeCameraRotation=(rad)=>{
        let newRotation = [...cameraRotation];
        newRotation[2]=newRotation[2]+rad;
        setCameraRotation(newRotation)
    }

    const changeOrbit=()=>{
        setOrbit(!orbit);
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
                    rotation={cameraRotation}
                    size={[160,160,160]}
                    position={[0,0,180]}
                >
                    
                    {/* <Pointer position={light}/> */}
                    {/* <GroundGrid  orbit={orbit}/> */}
                    <OrbitControl cameraPosition={cameraPosition} orbit={orbit}/>
                    <AStar/>
                    {/* <CustomBox position={[0,0,-120]} /> */}
                    
                </group>
                {/* <gridHelper rotate={[45,45,45]} args={[200,20,'red','blue',50]} /> */}
                <pointLight distance={100} intensity={4} color="white" />
                
                {boxes.map(box=>
                    <Box position={box}/>
                )}

            </Canvas>

            <CameraControls 
                changeCameraPosition={changeCameraPosition} 
                changeCameraRotation={changeCameraRotation}    
                changeOrbit = {changeOrbit}
                orbit = {orbit}
            />
        </div>
    )
}
