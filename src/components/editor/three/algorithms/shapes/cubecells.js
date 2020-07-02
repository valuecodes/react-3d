import React from 'react'

export default function CubeCells({cubeCells}) {
    return (
        <>
            {Object.keys(cubeCells).map((elem,index)=>
                <primitive 
                    object={cubeCells[elem].mesh}  
                    onClick={e => console.log(cubeCells[elem].mesh)}
                />
            )}
        </>
    )
}
