import React,{useState} from 'react'

export default function Option({options}) {
    
    const [selectedShape, setSelectedShape] = useState(null);

    return (
        <div className='addNew' style={{display:options?'':'none'}}>
            <button >Box</button>
            <button >Grid</button>
        </div>
    )
}
