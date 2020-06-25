import React from 'react'

export default function NavigationBarButton({ button, changePosition }) {
    return (
        <button 
            className='navigationBarButton'
            onClick={e => changePosition(button)}
            >
            {button}
        </button>
    )
}
