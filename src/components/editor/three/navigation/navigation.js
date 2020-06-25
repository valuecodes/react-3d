import React,{useState} from 'react'
import NavigationBarButton from './navigationBarButton'

export default function Navigation({ changePosition}) {

    const [buttons, setButtons]=useState(['Last', 'test', 'Next'])

    return (
        <div className='navigation'>
            <div className="navigationBar">
                {buttons.map(button=>
                    <NavigationBarButton button={button} changePosition={changePosition}/>
                )}
            </div>
        </div>
    )
}
