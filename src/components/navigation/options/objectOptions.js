import React,{useState} from 'react'
import Option from './Option'

export default function ObjectOptions() {

    const [options,setOptions]=useState(false);

    console.log(options)
    return (
        <div className='options'>
            <button className='optionButton' onClick={e => setOptions(!options)}>Add new</button>
            <Option options={options}/>
        </div>
    )
}
