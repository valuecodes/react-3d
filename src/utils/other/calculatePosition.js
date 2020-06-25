
export function calculatePosition(size,position,grid=5){
    return [(size[0]*-grid/2)+position[0],0+position[1],size[1]*-grid/2+position[2]]
}

export function calculateTextHeaderPosition(size,position){
    return [position[0]-85,0,-20]
}

export function calculateListPosition(size,position,index){
    return [position[0]-25,0,(index*12)+1]
}

export function updateAnimation(blocks,speed){
    let flag=true;
    for(var i=0;i<blocks.length-2;i++){
        if(blocks[i].type!=='Mesh') break
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