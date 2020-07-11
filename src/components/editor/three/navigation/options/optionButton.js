import React,{ useContext } from 'react'
import { GlobalOptions } from '../../../../../context/GlobalOptions'

export default function OptionButton({ option, name }) {

    const {options,modifyOptions}=useContext(GlobalOptions);

    let selected=false;
    
    if(options[name]===option){
        selected=true
    }

    return (
        <button
            onClick={e => modifyOptions(name,option)}
            style={{backgroundColor:selected?'green':'gray'}}
        >
            {option}
        </button>
    )
}
