import { Vector3 } from 'three';

export function calculatePosition(size,position,grid=5){
    return [(size[0]*-grid/2)+position[0],0+position[1],size[1]*-grid/2+position[2]]
}

export function calculateCubePosition(size,position,grid){

    return [
        (size[0]*-grid/2)+position[0],
        (size[0]*+grid/2)+position[1],
        size[1]*-grid/2+position[1]
    ]

}
export function calculateGroupPosition(size,cellSize=5){

    return [
        (size[0]*cellSize)/2,
        0-(size[0]*cellSize)/2,
        (size[0]*cellSize)/2
    ]
}

export function rotateToCurrentSide(group,current){
    let rotation=group.current.rotation;
    let side=current.sideName;
    let target={
        x:0,
        y:0,
        z:0,
    }

    if(side==='top'){
        target.x=0
        target.z=0
    }
    if(side==='back'){
        target.x=Math.PI/2
    }
    if(side==='front'){
        target.x=-Math.PI/2
    }
    if(side==='left'){
        target.z=-Math.PI/2
    }
    if(side==='right'){
        target.z=Math.PI/2
    }
    if(side==='bot'){
        target.z=Math.PI
    }

    return target
}

export function calculateTextHeaderPosition(size,position){
    return [position[0]-85,0,-20]
}

export function calculateListPosition(size,position,index){
    return [40,0,35+(index*12)]
}

export function calculateButtonPosition(index){
    return [5+(30*index),0,20]
}

export function updateAnimation(blocks,speed){
    let flag=true;
    for(var i=0;i<blocks.length-2;i++){
        if(blocks[i].type!=='Mesh') break
        if(blocks[i].target===null) continue
        if(blocks[i].position.x>blocks[i].target[0]){
            blocks[i].position.x-=speed
            flag=false
        }
        if(blocks[i].position.x<blocks[i].target[0]){
            blocks[i].position.x+=speed
            flag=false
        }

        if(blocks[i].position.z>blocks[i].target[1]){
            blocks[i].position.z-=speed
            flag=false
        }
        if(blocks[i].position.z<blocks[i].target[1]){
            blocks[i].position.z+=speed
            flag=false
        }
    }
    return flag
}

export function updateCubeAnimation(blocks,speed,rotationSpeed=0.05){

    let flag=true;
    let posTreshold=speed*2;
    let rotTreshold=rotationSpeed*2;
    let keys=Object.keys(blocks)

    for(var i=0;i<keys.length;i++){

        let targetPos=blocks[keys[i]].targetPosition
        let currentPos=blocks[keys[i]].mesh.position
        let posKeys=Object.keys(targetPos)

        for(var a=0;a<posKeys.length;a++){
            let index=posKeys[a]
            if(currentPos[index]!==targetPos[index]){
                flag=false;    
                let direction=currentPos[index]>targetPos[index]?-1:1;
                currentPos[index]+=speed*direction;
                if(Math.abs(currentPos[index]-targetPos[index])<posTreshold){
                    currentPos[index]=targetPos[index]
                }             
            }
        }

        let targetRotation=blocks[keys[i]].targetRotation
        let currentRotation=blocks[keys[i]].mesh.rotation
        let rotationKeys=Object.keys(targetRotation)
        
        for(var a=0;a<rotationKeys.length;a++){
            let index=rotationKeys[a]
            // console.log(index)
            if(currentRotation[index]!==targetRotation[index]){
                flag=false;    
                let direction=currentRotation[index]>targetRotation[index]?-1:1;
                currentRotation[index]+=rotationSpeed*direction;
                if(Math.abs(currentRotation[index]-targetRotation[index])<rotTreshold){
                    currentRotation[index]=targetRotation[index]
                }             
            }
        }

    }

    return flag
}

export function setCubePosition(blocks){

    let keys=Object.keys(blocks)

    for(var i=0;i<keys.length;i++){

        let targetPos=blocks[keys[i]].targetPosition
        let currentPos=blocks[keys[i]].mesh.position
        let posKeys=Object.keys(targetPos)

        for(var a=0;a<posKeys.length;a++){
            let index=posKeys[a]
            currentPos[index]=targetPos[index]
        }

        let targetRotation=blocks[keys[i]].targetRotation
        let currentRotation=blocks[keys[i]].mesh.rotation
        let rotationKeys=Object.keys(targetRotation)
        
        for(var a=0;a<rotationKeys.length;a++){
            let index=rotationKeys[a]
            currentRotation[index]=targetRotation[index]
        }

    }

    return true
}


export function calculatePathPosition(cor,cellSize){

    let offset=cellSize;
    let xOffset=cor.sideName==='right'?offset:cor.sideName==='left'?-offset:0
    let yOffset=cor.sideName==='top'?offset:cor.sideName==='bot'?-offset:0
    let zOffset=cor.sideName==='front'?offset:cor.sideName==='back'?-offset:0
    
    return new Vector3(
        cor.cubePosition.x+xOffset, 
        cor.cubePosition.y+yOffset, 
        cor.cubePosition.z+zOffset
    )
}