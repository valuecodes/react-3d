import React, { useState, useRef, useEffect } from 'react'
import usePromise from "react-promise-suspense"
import { disposeElements } from './../../../other/disposeElements'
import Header from './header'
import Buttons from './buttons'
import List from './list'
import Slider from './slider'

export default function ControlPanel(props) {
    const {
        controlPanelOptions,
        renderer,
        buttonClick,
        updateSliderValue
    } = props
    return (
        <>
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
            <Slider
                renderer={renderer} 
                updateSliderValue={updateSliderValue}
            />
        </>
    )
}
