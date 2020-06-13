import React,{useRef} from 'react'
import { useThree, Renderer } from 'react-three-fiber'
import { Vector2 } from 'three'
export default function BackgroundPlane(props) {
    
    const { addPoint, setPosition} = props
    const {
        mouse,
        renderer,
        camera
    } = useThree()
    const mesh = useRef();

    const trackPosition=(e)=>{
        // var canvas = document.getElementById("canvas");
        
        // var controls = new DragControls( objects, camera, renderer.domElement );

        // var rect = canvas.getBoundingClientRect();
        // console.log(raycaster)
        // let screenPoint =  new Vector2();
        // screenPoint.set(  ( e.clientX - rect.left ) / ( rect.width - rect.left )  * 2 - 1,
        //  - (  ( e.clientY - rect.top ) / ( rect.bottom - rect.top)) * 2 + 1 );
        // console.log(screenPoint)

        // raycaster.setFromCamera( screenPoint, camera );
        // console.log(screenPoint)
        let x = (mouse.x * window.innerWidth) / 10
        let y = ((mouse.y * window.innerHeight) / 15)*-1
        setPosition([x ,y,-150])
    }

    return (
        <mesh 
        ref={mesh}
            rotation={[-Math.PI/2,0,0]} 
            onClick={e => addPoint(e)} 
            onPointerMove={e => trackPosition(e)}
            receiveShadow={true} 
            position={[0,-1,0]} 
            >
            <planeBufferGeometry attach="geometry" args={[1000, 1000, 1]} />
            <meshBasicMaterial attach="material" color="white" />
          </mesh>  
    )
}
