import React,{useState, useEffect, useRef} from 'react'
import GridBlock from './gridBlock'

export default function Grid({cameraPosition,orbit}) {

    const [grid, setGrid]=useState([]);

    useEffect(()=>{
        let newGrid=[];
        for(var i=-18;i<=18;i++){
            for(var a=-18;a<=18;a++){
                newGrid.push([i*10,(a*10),-100])
            }
        }
        setGrid(newGrid)
    },[])

    return (
        <>
            {grid.map(block=>
                <GridBlock position={block} orbit={orbit}/>
            )}
        </>
    )
}
