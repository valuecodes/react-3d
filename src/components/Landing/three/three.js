import React,{useState,useEffect,useRef,useRender} from 'react'
import ReactDOM from 'react-dom'
import Box from './box'
import Pointer from './pointer'
import Grid from './grid/grid'
import Ground from './ground/ground'
import GroundGrid from './ground/groundGrid'
import CameraControls from './camera/cameraControls'
import { Canvas, useFrame,useThree} from 'react-three-fiber'

export default function Three() {

    const [light,setLight]=useState([25,-10,-250]);
    const [boxes,setBoxes]=useState([]);
    const [gridRow,setGridRow]=useState([]);
    const [gridColumn,setGridColumn]=useState([]);

    const [cameraPosition, setCameraPosition]=useState([0,0,120]);
    const [cameraRotation, setCameraRotation]=useState([0,0,0]);

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
        console.log([e.clientX-900,(e.clientY-400)*-1,-450])

        setLight([e.clientX-window.innerWidth/2 ,(e.clientY-window.innerHeight/2)*-1,-150])
    }

    const changeCameraPosition=(newPosition)=>{
        setCameraPosition(newPosition)
    }

    const changeCameraRotation=(rad)=>{
        
        let newRotation = [...cameraRotation];
        newRotation[2]=newRotation[2]+rad;
        console.log(newRotation);
        setCameraRotation(newRotation)
    }
console.log(...cameraPosition)
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
                    // position={[-80,-80,100]}
                    position={[0,0,100]}
                >
                    {/* <Pointer position={light}/> */}
                    <GroundGrid cameraPosition={cameraPosition}/>
                </group>

                <pointLight distance={100} intensity={4} color="white" />
                {/* <Box position={light} /> */}
                {boxes.map(box=>
                    <Box position={box}/>
                )}
            </Canvas>
            <CameraControls 
                changeCameraPosition={changeCameraPosition} 
                changeCameraRotation={changeCameraRotation}    
            />
        </div>
    )
}
