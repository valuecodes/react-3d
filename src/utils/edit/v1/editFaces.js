import React,{useRef, useState, useEffect} from 'react'
import DragPoint from './dragPoint'

export default function EditFaces({faces, current, updateFaces}) {
    const helper=useRef();
    const [dragPoints, setDragPoints] = useState([]);

    useEffect(()=>{
        setDragPoints(faces)            
    },[faces])
        
    return (
        <>
            {dragPoints.map((position,index)=>
                <DragPoint 
                    updateFaces={updateFaces} 
                    current={current} 
                    position={position} 
                    key={index} 
                    index={index}
                    type={'face'}
                />
            )}
          
          </>
    )    
}
