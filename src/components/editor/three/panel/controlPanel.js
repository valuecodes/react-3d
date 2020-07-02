import React, { useState, useRef, useEffect } from 'react'
import { disposeElements } from './../../../../utils/other/disposeElements'
import Header from './header'
import Buttons from './buttons'
import List from './list'
import Slider from './slider'
import Options from './options'

export default function ControlPanel(props) {
    const {
        controlPanelOptions,
        renderer,
        buttonClick,
        updateSliderValue,
        options,
        cubes,
        controlPanel,
        pathLine,
        aStarRef,
        tracker
    } = props
    return (
        <>
        <group
                position={[-100,0,-20]}
                ref={controlPanel}
        >
            <Header 
                text={'Maze Cube'}
                renderer={renderer}     
            />                
            <Buttons
                buttons={controlPanelOptions.buttons}
                buttonClick={buttonClick}
                renderer={renderer} 
            />
            <List
                list={controlPanelOptions.list}
                renderer={renderer} 
            />
            <Options
                controlPanelOptions={controlPanelOptions.options}
                renderer={renderer} 
                cubes={cubes}
                pathLine={pathLine}
                aStarRef={aStarRef}
                options={options}
                tracker={tracker}
            />
            <Slider
                renderer={renderer} 
                updateSliderValue={updateSliderValue}
            />
        </group>
        </>
    )
}
