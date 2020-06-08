import React,{useState} from 'react'
import Three from './three/three'

export default function LandingPage() {
    const [boxes,setBoxes]=useState([]);
    return (
        <div className='landing'>
            <Three/>
        </div>
    )
}
