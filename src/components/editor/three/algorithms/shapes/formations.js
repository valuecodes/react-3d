export function calculateCubeFormation(j,i,startX,startZ,side,size,cellSize){

    let padding=cellSize/2
    let sideLength=size*cellSize;

    if(side==='top'){
        return{
            position:{
                x:((j*cellSize)+startX),
                y:0,
                z:((i*cellSize)+startZ),

            },  
            rotation:{
                x:0,
                y:0,
                z:0
            }
        }

    }

    if(side==='front'){
        return{
            position:{
                x:((j*cellSize)+startX),
                y:((startZ-(i*cellSize))-startZ)-padding,
                z:startZ-padding,

            },  
            rotation:{
                x:Math.PI/2,
                y:0,
                z:0
            }
        }

    }

    if(side==='left'){
        return{
            position:{
                x:0-padding,
                y:((-sideLength+(j*cellSize)))+padding,
                z:(i*cellSize),

            },  
            rotation:{
                x:0,
                y:0,
                z:Math.PI/2
            }
        }
    }

    if(side==='right'){
        return{
            position:{
                x:startX-padding,
                y:(j*-cellSize)-padding,
                z:(i*cellSize),

            },  
            rotation:{
                x:0,
                y:0,
                z:-Math.PI/2
            }
        }
    }

    if(side==='back'){
        return{
            position:{
                x:(j*cellSize)+startX,
                y:-sideLength+(i*cellSize)+padding,
                z:0-padding

            },  
            rotation:{
                x:-Math.PI/2,
                y:0,
                z:0
            }
        }
    }

    if(side==='bot'){
        return{
            position:{
                x:(j*cellSize),
                y:-sideLength,
                z:sideLength-(i*cellSize)-cellSize

            },  
            rotation:{
                x:-Math.PI,
                y:0,
                z:0
            }
        }
    }

}

export function calculateOpenFormation(x,y,startingX,startingZ,cellSize){
    return {
        position:{
            x:(x*cellSize)+startingX,
            y:-30,
            z:(y*cellSize)+startingZ,
        },
        rotation:{
            x:0,
            y:0,
            z:0
        }
    }
}

export function calculateStartingFormation(x,y,startingX,startingZ,cellSize){
    return {
        position:{
            x:0,
            y:0,
            z:0,
        },
        rotation:{
            x:0,
            y:0,
            z:0
        }
    }
}