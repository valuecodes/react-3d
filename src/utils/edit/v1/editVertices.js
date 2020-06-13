import React,{useRef, useState, useEffect} from 'react'
import DragPoint from './dragPoint'

import { extend, Canvas, useRender, useThree, useResource } from 'react-three-fiber'
// import Vertice from './../components/vertice/vertice'

export default function EditVertices({vertices, current, updateVertices}) {
    const helper=useRef();
    const [dragPoints, setDragPoints] = useState([]);

    useEffect(()=>{
        let newVertices=[...vertices]
        // console.log(newVertices)
        setDragPoints(newVertices)            
    },[vertices])
    return (
        <>
            {dragPoints.map((position,index)=>
                <DragPoint 
                    updateVertices={updateVertices} 
                    current={current} 
                    position={Object.values(position)} 
                    key={index} 
                    index={index}
                    type={'vertice'}
                    />
                )}
          
          </>
    )        

}
