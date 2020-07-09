import { Vector3 } from 'three';

export function resetCube(cubes,sides,pathLine,options,aStarRef,tracker){

    const {
        obstacles,
        walls,
        colorScheme,
        size,
        cellSize
    } = options

    Object.keys(cubes.current).forEach(cube=>{
        cubes.current[cube].mesh.material.color.set( colorScheme.initial )
        cubes.current[cube].visited=false
        
        if(walls){
            cubes.current[cube].walls=[true,true,true,true]
            // cubes.current[cube].setWalls(cubes.current[cube])
        }
        if(obstacles){
            cubes.current[cube].obstacle=false
            cubes.current[cube].mesh.scale.y=1
        }
    })

    for(var i=0;i<sides.length;i++){
        let keys=Object.keys(sides[i].sideEdges)
        for(var a=0;a<keys.length;a++){
            sides[i].sideEdges[keys[a]].addEdgeNeigbors(sides[i].sideEdges[keys[a]],cubes.current,sides)
        }
    } 

    if(obstacles){
        let keys=Object.keys(cubes.current);
        Object.keys(cubes.current).forEach((cube,index)=>{
            setObstacles(cubes.current,keys,index,size,cellSize);
        })        
    }

    
    if(pathLine.current){
        pathLine.current.geometry.setFromPoints([])
    }
    if(aStarRef.current){
        aStarRef.current={
            openSet:[],
            closedSet:[],
            path:[],
            noSolution:false,
            start:[],
            end:[]
        }
    }
    if(tracker.current){
        tracker.current.position.x=0
        tracker.current.position.y=0
        tracker.current.position.z=0
        tracker.current.material.visible=false;
    }
    setWallsInvisible(cubes)
}

function setWallsInvisible(cubes){
    let cubeCells=cubes.current
    Object.keys(cubeCells).forEach((block)=>{
        cubeCells[block].mesh.children.forEach((elem,index) =>{
            elem.material.visible=false
        })      
    })
}

export function setWallsVisible(cubes){
    let cubeCells=cubes.current
    Object.keys(cubeCells).forEach((block)=>{
        cubeCells[block].mesh.children.forEach((elem,index) =>{
            elem.material.visible=cubeCells[block].walls[index]
        })      
    })
}

export function removeFromArray(arr,elt){
    for(var i=arr.length-1;i>=0;i--){
        if(arr[i]===elt){
            arr.splice(i,1);
        }
    }
}

export function heuristic(a,b){
    return calcuteDistance(a.cubeFormation.position,b.cubeFormation.position)
}

export function calcuteDistance(current, target){
    let distance=
    Math.abs(current.x-target.x)+
    Math.abs(current.y-target.y)+
    Math.abs(current.z-target.z) 
    return distance
}

export function updateTrackerPosition(tracker,path){

    if(path[0]){
        if(tracker.current.track.target===0){
            let current=tracker.current.position
            let targetPos=path[0].targetFormation.position

            let keys=Object.keys(targetPos)
            for(var i=0;i<keys.length;i++){
                let index=keys[i]
                current[index]=targetPos[index]     
            }        
        }        
    }
}

export function updatePathPosition(path,blocks,pathLine,options,openFormation){

    let coordinates = path.map((cor,index) =>
        calculatePathPosition( blocks[cor.id],options,path[index-1],openFormation)
    )
    pathLine.current.geometry.setFromPoints(coordinates.flat())
}

export function addPathLine(path, pathLine,options,openFormation=false){
    
    let coordinates = path.map((cor,index) =>
        calculatePathPosition(cor,options,path[index-1])
    )
    pathLine.current.geometry.setFromPoints(coordinates.flat())
}

function calculatePathPosition(cor,options,next,openFormation=false){

    const{
        size,
        cellSize
    } = options

    // let offset=cellSize/10;
    let offset=0.3;
    let position=cor.mesh.position
    let coordinates=[];

    let xOffset=cor.side==='right'?offset:cor.side==='left'?-offset:0
    let yOffset=cor.side==='top'?offset:cor.side==='bot'?-offset:0
    let zOffset=cor.side==='front'?offset:cor.side==='back'?-offset:0

    coordinates=[new Vector3(
        openFormation?position.x:position.x+xOffset, 
        openFormation?position.y+offset:position.y+yOffset, 
        openFormation?position.z:position.z+zOffset
    )]

    if(cor&&next&&!openFormation){
        if(cor.sideID!==next.sideID){
            let nextPosition=next.cubeFormation.position

            let nxOffset=next.side==='right'?offset:next.side==='left'?-offset:0
            let nyOffset=next.side==='top'?offset:next.side==='bot'?-offset:0
            let nzOffset=next.side==='front'?offset:next.side==='back'?-offset:0

            let xEdge;
            let yEdge;
            let zEdge;

            if(position.x===nextPosition.x){
                xEdge=position.x
                yEdge=calculateEdge(position.y+yOffset,nextPosition.y+nyOffset,cellSize+offset)
                zEdge=calculateEdge(position.z+zOffset,nextPosition.z+nzOffset,cellSize+offset)
            }
            if(position.y===nextPosition.y){
                xEdge=calculateEdge(position.x+xOffset,nextPosition.x+nxOffset,cellSize+offset)
                yEdge=position.y
                zEdge=calculateEdge(position.z+zOffset,nextPosition.z+nzOffset,cellSize+offset)
            }
            if(position.z===nextPosition.z){
                xEdge=calculateEdge(position.x+xOffset,nextPosition.x+nxOffset,cellSize+offset)
                yEdge=calculateEdge(position.y+yOffset,nextPosition.y+nyOffset,cellSize+offset)
                zEdge=position.z
            }



            coordinates.unshift(new Vector3(
                xEdge, 
                yEdge, 
                zEdge
            ))
        }
    }

    return coordinates
}

function calculateEdge(a,b,cellSize){
    if(a===0) cellSize*=-1
    if(b===0) cellSize*=-1
    return Math.abs(a+cellSize)>Math.abs(b+cellSize)?a:b
}

export function calculatePath(currentCell){
        let path=[];
        var temp=currentCell;
        path.push(temp)
        if(temp){
            while(temp.previous){
                path.push(temp.previous)
                temp=temp.previous
            }                           
        }
        return path
}

export function setObstacles(cell,keys,a,size,cellSize){
    if(Math.random(1)<0.02){
        cell[keys[a]].setObstacle(cellSize) 
        if(cell[keys[a+1]]) cell[keys[a+1]].setObstacle(cellSize)  
        if(cell[keys[a-1]]) cell[keys[a-1]].setObstacle(cellSize)  
        if(cell[keys[a+2]]) cell[keys[a+2]].setObstacle(cellSize)   
        if(cell[keys[a+3]]) cell[keys[a+3]].setObstacle(cellSize)   
    }  
    if(Math.random(1)<0.02){
        cell[keys[a]].setObstacle(cellSize)  
        if(cell[keys[a+size]]) cell[keys[a+size]].setObstacle(cellSize)  
        if(cell[keys[a-size]]) cell[keys[a-size]].setObstacle(cellSize)  
        if(cell[keys[a+size*2]]) cell[keys[a+size*2]].setObstacle(cellSize)   
        if(cell[keys[a+size*-2]]) cell[keys[a+size*-2]].setObstacle(cellSize) 
    }       
}