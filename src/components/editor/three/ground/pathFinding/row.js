import React from 'react'
import GridBlock from './gridBlock'

export default function Row({row}) {        
    return (
        <>
            {row.map(spot=>
                <GridBlock spot={spot} position={spot.getPos()}/>
            )}
        </>
    )   
}
