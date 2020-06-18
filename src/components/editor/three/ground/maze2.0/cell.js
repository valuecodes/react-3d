import React from 'react'
import Wall from './wall'

export default function Cell({cell}) {

    let walls=cell.getWalls();

    function getColor(){
        if(cell.current){
            return 'purple'
        }else{
            return cell.visited?'green':'white'
        }
    }
 
    return (
        <>

            <mesh
                position={cell.getPosition()}
                // {...cell.getPosition()}
                // ref={mesh}
                scale={[1, 1, 1]}
            >
                <boxBufferGeometry attach="geometry" args={[5, 1, 5]} />
                <meshStandardMaterial attach="material" color={getColor()} />
            </mesh>            
            {walls.map(wall=>
                <Wall
                cell={cell}
                position={wall.position}
                geometry={wall.geometry}/>
            )}
        </>

    )
}
