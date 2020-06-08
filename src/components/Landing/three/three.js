import React,{useState,useEffect} from 'react'
import Box from './box'
import Pointer from './pointer'
import Grid from './grid/grid'
import { Canvas, useFrame } from 'react-three-fiber'

export default function Three() {

    const [light,setLight]=useState([25,-10,-250]);
    const [boxes,setBoxes]=useState([]);
    const [gridRow,setGridRow]=useState([]);
    const [gridColumn,setGridColumn]=useState([]);

    // console.log(light)

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
        // setLight([e.clientX-window.innerWidth/2 ,(e.clientY-400)*-1,-250])


        setLight([e.clientX-window.innerWidth/2 ,(e.clientY-window.innerHeight/2)*-1,-250])

        // console.log(e.clientX-900,(e.clientY-400)*-1,-250)
        // var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        // vector.unproject( camera );
        // var dir = vector.sub( camera.position ).normalize();
        // var distance = - camera.position.z / dir.z;
        // var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    }

    return (
        <div className='canvas' 
            onMouseMove={(e)=>trackPosition(e)}
            onClick={addBox}
            >
            <Canvas>
                <ambientLight />
                <pointLight position={light} />
                <Pointer position={light}/>

                <Grid />
                
                <pointLight distance={100} intensity={4} color="white" />
                {/* <Box position={light} /> */}
                {boxes.map(box=>
                    <Box position={box}/>
                )}
            </Canvas>
        </div>
    )
}
