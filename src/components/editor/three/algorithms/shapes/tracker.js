import React, {useState,useEffect,useRef} from 'react'
import { useFrame } from 'react-three-fiber'

export default function Tracker(props) {

    const{
        tracker,
        state,
        setState,
        aStarRef,
        automaticRotation,
        options
    } = props

    let {
        pause,
        maze,
        animation,
        aStar,
        ready,
        tracking,
    } = state
    let newState={...state}
    
    const [start, setStart] = useState(false)
    const track=useRef({
        current:0,
        target:1
    });
    if(tracker.current){
        tracker.current.track=track.current
    }

    useEffect(()=>{
        if(tracking) startTracking()
    },[tracking])

    function startTracking(){

        let current=tracker.current.position
        let target=aStarRef.current.path.length-2
        tracker.current.material.visible=true;
        track.current={
            current:current,
            target:target,
        }
        
        setStart(true)
    }

     

    useFrame(()=>{
        if(start){

            let current = trackPosition(track,aStarRef,1)

            if(options.automaticRotation&&current){
                automaticRotation(current)
            }

            if(track.current.target<0){
                track.current.target=0
                newState.tracking=false
                setState(newState)
                setStart(false)             
            }
            
        }
    })


    return (
        <mesh
            ref={tracker}
        >
            <sphereBufferGeometry attach="geometry"/>
            <meshBasicMaterial attach="material" color={options.colorScheme.tracker} visible={false}/>
        </mesh>
    )
}
    function trackPosition(track,aStarRef,speed=0.5){
        
        let {
            current,
            target
        } = track.current

        let path=aStarRef.current.path;
        if(!path) return
        let targetPos=path[target].targetFormation.position

        let keys=Object.keys(targetPos)
        let flag=true
        let posTreshold=speed*2;
        for(var i=0;i<keys.length;i++){
            let index=keys[i]
            if(current[index]!==targetPos[index]){
                flag=false; 
                let direction=current[index]>targetPos[index]?-1:1;
                current[index]+=speed*direction;
                if(Math.abs(current[index]-targetPos[index])<posTreshold){
                    current[index]=targetPos[index]
                }  
            }
        }
        if(flag){
            track.current.target--;
        }
        return path[target]
    }   