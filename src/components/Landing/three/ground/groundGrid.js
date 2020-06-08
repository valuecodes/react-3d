import React,{useState,useEffect} from 'react'
import GridBlock from './gridBlock'

export default function GroundBlock() {

    const [grid,setGrid]=useState([]);

    useEffect(()=>{
        let newGrid=[];
        for(var i=-7;i<8;i++){
            for(var a=-5;a<9;a++){
                newGrid.push([i*20,200-(a*20),-150])
            }
        }
        setGrid(newGrid)
    },[])

    return (
        <>
        {grid.map(block=>
            <GridBlock position={block}/>
        )}
        </>
    )
}
