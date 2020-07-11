import React,{ createContext,useReducer } from 'react'
import AppReducer from './AppReducer'

const initialOptions={
    options:{
        Algorithm:null,
        Shape:null,
        Mode:'Rotate',
        orbit:true,
        Position:'Outside',
        sphere:{
            size:50,
            detail:4,
            wallWidth:4,
            obstacles:false,
            pathLine:'black',
            wallColors:{
                unvisited:'red',
                visited:'black',
                notVisible:'',
            },
            colorScheme:{
                color:'gray',
                q1:'#262729',
                q2:'#262729',
                q3:'#262729',
                q4:'#262729',
                q5:'#262729',
                q6:'#262729',
                q7:'#262729',
                q8:'#262729',
                seam:'#262729',
                pentagon:'#262729',
                notVisible:'',
                selected:'yellow',
                current:'purple',
                openSet:'seagreen',
                closedSet:'salmon',
                path:'white',
                obstacle:'black',
                start:'yellow',
                target:'red'
            }
        }
    }
}

export const GlobalOptions = createContext(initialOptions);

export const GlobalOptionsProvider=({children})=>{

    const [state,dispatch]= useReducer(AppReducer,initialOptions);

    const modifyOptions=(option,value)=>{
        
        let modifiedOptions={...state.options};
        modifiedOptions[option]=value;

        dispatch({
            type:'MODIFY_OPTIONS',
            payload:{
                data:modifiedOptions
            },
        })  
    }

    return (<GlobalOptions.Provider
        value={{
            options:state.options,
            modifyOptions,
        }}
       >
           {children}
       </GlobalOptions.Provider>)
} 
