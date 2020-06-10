import React,{useState, useEffect, useRef} from 'react'
import GridBlock from './gridBlock'

export default function Grid({shape}) {

    const [grid, setGrid]=useState([]);

    useEffect(()=>{
        console.log(shape)
        const {cols, rows} = shape
        let newGrid=[];
        for(var i=0;i<cols;i++){
            for(var a=0;a<rows;a++){
                newGrid.push([i*10,0,(a*10)])
            }
        }
        setGrid(newGrid)
    },[shape])

    return (
        <>
            {grid.map(block=>
                <GridBlock position={block}/>
            )}
        </>
    )
}
