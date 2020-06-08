import React,{useEffect,useState} from 'react'
import { useFrame } from 'react-three-fiber'
import GridRow from './gridRow'
import GridColumn from './gridColumn'

export default function Grid() {

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

    useEffect(()=>{
        let newGridColumn=[];
        for(var i=900;i>-900;i-=20){
            newGridColumn.push([i,-110,-250]);
        }
        console.log(newGridColumn)
        setGridColumn(newGridColumn)
    },[])

    return (
        <>
            {gridRow.map(elem=>
                <GridRow position={elem}/>
            )}
            {gridColumn.map(elem=>
                <GridColumn position={elem}/>
            )}
            
        </>
    )
}
