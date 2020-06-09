import React,{useState, useEffect, useRef} from 'react'
import GridBlock from './gridBlock'

export default function GroundGrid({cameraPosition,orbit}) {

    const [grid, setGrid]=useState([]);

    useEffect(()=>{
        let newGrid=[];
        for(var i=-8;i<=8;i++){
            for(var a=-8;a<=8;a++){
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
