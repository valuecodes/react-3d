import { func } from "prop-types";

export function calculatePosition(size,position){
    return [(size[0]*-2.5)+position[0],0+position[1],size[1]*-2.5+position[2]]
}

export function calculateTextHeaderPosition(size,position){
    return [size[0]*-2.5,0,-20]
}

export function calculateListPosition(size,position,index){
    return [(size[0]*-2.5),0,(index*12)]
}