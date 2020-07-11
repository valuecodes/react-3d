import React from 'react'
import OptionHeader from './optionHeader'
import OptionButton from './optionButton'

export default function Option({option}) {

    const {
        name,
        options
    } = option
    
    return (
        <div className='option'>
            <OptionHeader name={name}/>
            {options.map(option =>
                <OptionButton option={option.name?option.name:option} name={name}/>
            )}

        </div>
    )
}
