
export function calculatePosition(size,position,grid=5){
    return [(size[0]*-grid/2)+position[0],0+position[1],size[1]*-grid/2+position[2]]
}

export function calculateCubePosition(size,position,grid=5){
    return [
        (size[0]*-grid/2)+position[0],
        (size[0]*+grid/2)+position[1],
        size[1]*-grid/2+position[2]
    ]
}
export function calculateGroupPosition(size,position,grid=5){
    return [
        (size[0]*5)/2,
        size[0]*-2,
        (size[0]*5)/2
    ]
}

export function rotateToCurrentSide(group,current){
    let rotation=group.current.rotation;
    let side=current.side;
    
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
    console.log(target)
    return target


    // let speed=0.1

    // if(rotation.x!==target.x){
    //     let dir=rotation.x>target.x?-1:1;
    //     rotation.x+=speed*dir;
    //     if(Math.abs(rotation.x-target.x)<0.1){
    //         rotation.x=target.x
    //     }
    // }
    // if(rotation.z!==target.z){
    //     let dir=rotation.z>target.z?-1:1;
    //     rotation.z+=speed*dir;
    //     if(Math.abs(rotation.z-target.z)<0.1){
    //         rotation.z=target.z
    //     }
    // }
}

export function calculateTextHeaderPosition(size,position){
    return [position[0]-85,0,-20]
}

export function calculateListPosition(size,position,index){
    return [position[0]-25,0,(index*12)+1]
}

export function calculateButtonPosition(size,position,index){
    return [-75+25*index,0,0]
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

export function updateCubeAnimation(blocks,speed){
    let flag=true;

    let rotationSpeed=0.05

    for(var i=0;i<blocks.length;i++){
        if(blocks[i].type!=='Mesh') break
        if(blocks[i].target===null) continue
        
        if(blocks[i].position.x!==blocks[i].target.x){
            flag=false
            let dir=blocks[i].position.x>blocks[i].target.x?-1:1;
            blocks[i].position.x+=speed*dir;
            if(Math.abs(blocks[i].position.x-blocks[i].target.x)<4){
                blocks[i].position.x=blocks[i].target.x
            }
        }

        if(blocks[i].position.y!==blocks[i].target.y){
            flag=false
            let dir=blocks[i].position.y>blocks[i].target.y?-1:1;
            blocks[i].position.y+=speed*dir;
            if(Math.abs(blocks[i].position.y-blocks[i].target.y)<4){
                blocks[i].position.y=blocks[i].target.y
            }
        }

        if(blocks[i].position.z!==blocks[i].target.z){
            flag=false
            let dir=blocks[i].position.z>blocks[i].target.z?-1:1;
            blocks[i].position.z+=speed*dir;
            if(Math.abs(blocks[i].position.z-blocks[i].target.z)<4){
                blocks[i].position.z=blocks[i].target.z
            }
        }
        
        if(blocks[i].rotation.x!==blocks[i].target.xRotation){
            flag=false
            let dir=blocks[i].rotation.x>blocks[i].target.xRotation?-1:1;
            blocks[i].rotation.x+=rotationSpeed*dir;
            if(Math.abs(blocks[i].rotation.x-blocks[i].target.xRotation)<0.1){
                blocks[i].rotation.x=blocks[i].target.xRotation
            }
        }

        if(blocks[i].rotation.y!==blocks[i].target.yRotation){
            flag=false
            let dir=blocks[i].rotation.y>blocks[i].target.yRotation?-1:1;
            blocks[i].rotation.y+=rotationSpeed*dir;
            if(Math.abs(blocks[i].rotation.y-blocks[i].target.yRotation)<0.1){
                blocks[i].rotation.y=blocks[i].target.yRotation
            }
        }

        if(blocks[i].rotation.z!==blocks[i].target.zRotation){
            flag=false
            let dir=blocks[i].rotation.z>blocks[i].target.zRotation?-1:1;
            blocks[i].rotation.z+=rotationSpeed*dir;
            if(Math.abs(blocks[i].rotation.z-blocks[i].target.zRotation)<0.1){
                blocks[i].rotation.z=blocks[i].target.zRotation
            }
        }
    }

    if(flag){
        for(var i=0;i<blocks.length-2;i++){
            if(blocks[i].type!=='Mesh') break
            if(blocks[i].target===null) continue
            if(flag){
                blocks[i].position.x = blocks[i].target.x
                blocks[i].position.y = blocks[i].target.y
                blocks[i].position.z = blocks[i].target.z
                blocks[i].rotation.x = blocks[i].target.xRotation
                blocks[i].rotation.y = blocks[i].target.yRotation
                blocks[i].rotation.z = blocks[i].target.zRotation
            }
        }
    }

    return flag
}