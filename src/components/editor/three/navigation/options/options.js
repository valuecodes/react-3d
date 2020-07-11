import React,{ useState, useContext,useEffect } from 'react'
import Header from './header'
import SelectAlgo from './selectAlgo'
import OptionHeader from './optionHeader'
import Option from './option'
import { GlobalOptions } from '../../../../../context/GlobalOptions'

export default function Options() {

    const {options,modifyOptions}=useContext(GlobalOptions);

    const [subOptions, setSubOptions]=useState([]);

    const [algoOptions, setAlgoOptions]=useState([
         {name:'Algorithm',options:[
             {name:'Maze Creator',subOptions:[
                {name:'Simulation',options:['Start', 'Reset']}
             ]}, 
             {name:'Pathfinder',subOptions:[
                {name:'Mode',options:['Rotate','AddWalls','Add Start', 'Add Target']},
                {name:'Obstacles',options:[,'Set random', 'Clear All']},
                {name:'Simulation',options:['Start', 'Reset']}
             ]},
             {name:'Maze Pathfinder',subOptions:[
                {name:'Mode',options:['Rotate','Add Start', 'Add Target']},
                {name:'Simulation',options:['Start', 'Reset']}
             ]},
        ]},
    ])

    useEffect(()=>{
        let selectedOption=algoOptions[0].options.filter(algo => algo.name===options.Algorithm)
        if(selectedOption[0]){
            setSubOptions(selectedOption[0].subOptions)         
        }
    },[options])

     

    

    return (
        <div 
            className='options'
        >
            <Header/>
            <div className='controls'>
                
                {algoOptions.map(option =>
                    <Option option={option}/>
                )}

                {subOptions.map(option =>
                    <Option option={option}/>
                )}

            </div>
        </div>
    )
}
