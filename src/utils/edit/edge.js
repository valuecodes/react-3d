import React,{ useRef, useState, useCallback, useEffect } from 'react'
import { Vector3 } from "three";
import TransformControl from './transformControl'

import EdgeDragPoint from './edgeDragPoint'


export default function Edge(props) {

    const {
        edge,
        index, 
        selectEdge,
        selectedEdge, 
        current,
        updateEdge,
    } = props

    const [hover, setHover]=useState(false)
    const onUpdate = useCallback(self => self.setFromPoints(edge.points), [edge.points])

    function getColor(){
        if(index===selectedEdge){
            return 'red'
        }else if(hover){
            return 'red'
        }else{
            return 'gray'
        }
    }
    
    function select(){
        selectEdge(index);
    }

    function edgeHover(){
        
    }




    return (
        <>
        <line
            onClick={e => select()}
            onPointerOver={e => setHover(true)}
            onPointerOut={e => setHover(false)}
            >
            <bufferGeometry attach="geometry" onUpdate={onUpdate} />
            <lineBasicMaterial attach="material" color={getColor()} linecap={'round'} linejoin={'round'} />         
        </line>
        <EdgeDragPoint 
            position={edge.centroid} 
            selected={selectedEdge===index} 
            current={current}
            edge={edge}
            selectEdge={selectedEdge}
            select={select}
            hover={hover}
            index={index}
            updateEdge={updateEdge}
            />
        </>
    )
}
