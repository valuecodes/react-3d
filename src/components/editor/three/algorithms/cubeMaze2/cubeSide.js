import * as THREE from 'three'
import { Vector3, Geometry } from 'three';

export default function createNewCube(size){
    let sideLength=size*5;

    let top=new CubeSide(size,0,0,'top',0,[1,2,4,3]);
    top.addCells();

    let back=new CubeSide(size,0,-sideLength,'back',1,[5,2,0,3]);
    back.addCells()

    let right=new CubeSide(size,sideLength,0,'right',2,[1,5,4,0]);
    right.addCells()

    let left=new CubeSide(size,-sideLength,0,'left',3,[1,0,4,5]);
    left.addCells()

    let front=new CubeSide(size,0,sideLength,'front',4,[0,2,5,3]);
    front.addCells()

    let bot=new CubeSide(size,0,-sideLength*2,'bot',5,[4,2,1,3]);
    bot.addCells()
    
    let cubeSides=[
        top,
        back,
        right,
        left,
        front,
        bot
    ]

    for(var i=0;i<cubeSides.length;i++){
        cubeSides[i].sideEdges={};
        let keys=Object.keys(cubeSides[i].cells)
        for(var a=0;a<keys.length;a++){
            if(cubeSides[i].cells[keys[a]].edge!==null){
                cubeSides[i].sideEdges[keys[a]]=cubeSides[i].cells[keys[a]];
            }
        }
    }

    let newCells={
        ...cubeSides[0].cells,
        ...cubeSides[1].cells,
        ...cubeSides[2].cells,
        ...cubeSides[3].cells,
        ...cubeSides[4].cells,
        ...cubeSides[5].cells,
    }

    for(var i=0;i<cubeSides.length;i++){
        let keys=Object.keys(cubeSides[i].sideEdges)
        for(var a=0;a<keys.length;a++){
            cubeSides[i].sideEdges[keys[a]].addEdgeNeigbors(cubeSides[i].sideEdges[keys[a]],newCells,cubeSides)
        }
    } 
    console.log(newCells)
    return [newCells, cubeSides]
}

function CubeSide(size, startingX, startingZ, side, sideID,neighborSides){
    this.size=size;
    this.cells={};
    this.startingX=startingX;
    this.startingZ=startingZ;
    this.side=side;
    this.sideID=sideID;
    this.neighborSides=neighborSides;

    this.addCells=()=>{
        let newCells={};
        let test=0;
        for(var y=0;y<this.size;y++){    
            for(var x=0;x<this.size;x++){
                let xCor=x*5+startingX
                let zCor=y*5+startingZ

                let newCell=new Cell(
                    x,
                    y,
                    this.side,
                    this.sideID,
                    this.neighborSides,
                    size,
                    this.xCor,
                    this.zCor
                )
                let id=`${this.sideID}.${x}.${y}`

                newCell.createWalls()
                newCell.edge=checkEdge(x,y,size-1);
                newCell.startingX=xCor
                newCell.startingZ=zCor
                newCell.startingPosition.x=xCor
                newCell.startingPosition.z=zCor
                newCell.startingPosition.y=-30
                newCell.addNeighbors(newCell,this.sideID,size);
                newCell.mesh.position.x=this.size*5/2;
                newCell.mesh.position.y=-2;
                newCell.mesh.position.z=this.size*5/2;

                // newCell.mesh.position.x=xCor+(-50+(Math.random()*100))+100;
                // newCell.mesh.position.z=zCor+(-50+(Math.random()*100))-100;
                // newCell.mesh.position.y=-100;

                newCell.mesh.rotation.x=-10+(Math.random()*20);
                // newCell.mesh.rotation.y=-10+(Math.random()*20);
                newCell.mesh.rotation.z=-10+(Math.random()*20);

                newCell.id=id
                newCell.sideName=this.side

                newCell.cubeEdge=checkCubeEdge(y,x,this.size-1)
                calculateSidePosition(newCell,this.side,y,x,startingX,startingZ,this.size); 
                newCell.cubePosition=newCell.targetPosition
                newCell.cubeRotation=newCell.targetRotation
                if(newCell.edge!==null){
                    newCell.addEdgeCoordinates()
                }
                newCells[id]=newCell;
                
            }
        }
        this.cells=newCells
    }
}

function checkCubeEdge(y,x,size){
    let cubeEdge=null
    if(y===0&&x===0) cubeEdge=0
    if(y===0&&x===size) cubeEdge=1
    if(y===size&&x===0) cubeEdge=3
    if(y===size&&x===size) cubeEdge=2
    return cubeEdge
}

function checkEdge(x,y,size){
    let edge=null;
    if(x===0) edge=3;
    if(y===0) edge=0;
    if(x===size) edge=1;
    if(y===size) edge=2;
    return edge
}

function Cell(x,y,side,sideID,neighborSides,size, startingX, startingZ){
    this.x=x;
    this.y=y;
    this.size=size;
    this.neighborSides=neighborSides;
    this.visited=false;
    this.id=null;
    this.edge=null;
    this.side=side;
    this.side=sideID;
    this.edgeCoordinates=null;
    this.neighbors=[];
    this.walls=[true, true, true, true];
    this.current=false;
    this.startingX=startingX;
    this.startingZ=startingZ;
    this.startingPosition={
        x:this.startingX,
        y:this.startingZ,
        z:-30,
    }
    this.startingRotation={
        x:0,
        y:0,
        z:0,
    }
    this.targetPosition={
        x:startingX,
        y:startingZ,
        z:-30,
    }    
    this.targetRotation={
        x:0,
        y:0,
        z:0
    }

    this.geometry= new THREE.BoxBufferGeometry( 5, 0.5, 5 );
    this.material= new THREE.MeshStandardMaterial( {color:'green'});
    this.mesh=new THREE.Mesh( this.geometry, this.material);

    this.addEdgeCoordinates=()=>{
        let e=this.edge;
        let coor=this.targetPosition;
        let eCoordinates=[
            coor.x,
            coor.y,
            coor.z
        ]
    }


    this.addNeighbors=(cell,sideID,size)=>{
        let neighbors=[];

        if(cell.y-1<0) neighbors.push(null)
        else neighbors.push(sideID+'.'+cell.x+'.'+Number(cell.y-1));

        if(cell.x+1>size) neighbors.push(null)
        else neighbors.push(sideID+'.'+Number(cell.x+1)+'.'+cell.y);

        if(cell.y+1>size) neighbors.push(null)
        else neighbors.push(sideID+'.'+cell.x+'.'+Number(cell.y+1));

        if(cell.x-1<0) neighbors.push(null)
        else neighbors.push(sideID+'.'+Number(cell.x-1)+'.'+cell.y);

        this.neighbors=neighbors
    }

    this.setWalls=(current)=>{
        current.mesh.children[0].visible=current.walls[0];
        current.mesh.children[1].visible=current.walls[1];
        current.mesh.children[2].visible=current.walls[2];
        current.mesh.children[3].visible=current.walls[3];
    }

    this.addEdgeNeigbors=(current,cubes,sides)=>{
        
        let neighbors=[];
        let side=this.side;
        let size=this.size

        let top = cubes[this.neighbors[0]]
        let bottom = cubes[this.neighbors[2]]
        let right = cubes[this.neighbors[1]]
        let left = cubes[this.neighbors[3]]

        let cubeEdge=this.cubeEdge;

        if(current.edge===0||cubeEdge===1||cubeEdge===0){
            top=calculateTop(current,cubes,sides);
            if(top) this.neighbors[0]=top.id
        }

        if(current.edge===2||cubeEdge===2||cubeEdge===3){
            bottom=calculateBot(current,cubes,sides);
            if(bottom) this.neighbors[2]=bottom.id
        }

        if(current.edge===3||cubeEdge===0||cubeEdge===3){
            left=calculateLeft(current,cubes,sides);
            if(left) this.neighbors[3]=left.id
        }
        
        if(current.edge===1||cubeEdge===1||cubeEdge===2){
            right=calculateRight(current,cubes,sides);
            if(right) this.neighbors[1]=right.id
        }

    }

    this.getNextNeigbor=(current,cubes,sides)=>{

        let neighbors=[];

        let top = cubes[this.neighbors[0]]
        let bottom = cubes[this.neighbors[2]]
        let right = cubes[this.neighbors[1]]
        let left = cubes[this.neighbors[3]]

        if (top && !top.visited) {
            neighbors.push(top);
        }
        if (right && !right.visited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
            neighbors.push(bottom);
        }
        if (left && !left.visited){
            neighbors.push(left);
        }        

        if (neighbors.length > 0) {
            let r = Math.floor(Math.random()*neighbors.length);
            return neighbors[r]
        } else {
            return undefined;
        }
    }

    this.createWalls=()=>{
        let currentWalls=[];

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[6,1,1],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[1,1,6],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[6,1,1],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[1,1,6],
                pos:'left'
            })            
        }

        currentWalls.map(wall=>{
                let geo = new THREE.BoxBufferGeometry( ...wall.geometry )
                let mat =  new THREE.MeshStandardMaterial( {color:'black'} );
                let wall1=new THREE.Mesh( geo, mat);
                wall1.position.x=wall1.position.x+(wall.pos==='right'?2.5:wall.pos==='left'?-2.5:0);
                wall1.position.z=wall1.position.z+(wall.pos==='top'?-2.5:wall.pos==='bot'?2.5:0);
                this.mesh.add(wall1);
        })
    }
}

function calculateTop(current,cubes,sides){

    let id=`${current.neighborSides[0]}.${current.x}.${current.size-1}`

    if(cubes[id]){
        let distance=calcuteDistance(current.targetPosition,cubes[id].targetPosition) 
        if(distance>5) id=calculateFromDistance(current,sides,cubes)     
    }

    current.walls[0]=false

    return cubes[id]
}
function calculateBot(current,cubes,sides){

    let id=`${current.neighborSides[2]}.${current.x}.${0}`

    if(cubes[id]){
        let distance=calcuteDistance(current.targetPosition,cubes[id].targetPosition) 
        if(distance>5) id=calculateFromDistance(current,sides,cubes)     
    }

    current.walls[2]=false
    
    return cubes[id]
}
function calculateLeft(current,cubes,sides){
    let id=`${current.neighborSides[3]}.${current.size-1}.${current.y}`
    
    if(cubes[id]){
        let distance=calcuteDistance(current.targetPosition,cubes[id].targetPosition) 
        if(distance>5) id=calculateFromDistance(current,sides,cubes)    
    }

    current.walls[3]=false
    
    return cubes[id]
}
function calculateRight(current,cubes,sides){
    let id=`${current.neighborSides[1]}.${0}.${current.y}`

    if(cubes[id]){
        let distance=calcuteDistance(current.targetPosition,cubes[id].targetPosition)
        if(distance>5) id=calculateFromDistance(current,sides,cubes)    
    }

    current.walls[1]=false

    return cubes[id]
}

function calculateFromDistance(current,sides,cubes){

    let cTarget=current.targetPosition;
    let targetSide=sides.filter(side=>side.sideID===current.neighborSides[current.edge])

    if(targetSide[0]){
        
        let cells=targetSide[0].sideEdges
        let found=null;
        let keys=Object.keys(cells);

        for(var i=0;i>keys.length-1;i++){
            let aTarget=cells[keys[i]].targetPosition
            let distance=calcuteDistance(cTarget,aTarget)
            if(distance<6) {
                found=cells[keys[i]]
                break
            }
        }

        // if(cubes[found]){
        //     if(cubes[found].edge!==null){
        //         cubes[found].walls=[false,false,false,false]
        //     }
        // }
        return found       
    }
}

function calcuteDistance(current, target){
    let distance=
    Math.abs(current.x-target.x)+
    Math.abs(current.y-target.y)+
    Math.abs(current.z-target.z) 
    return distance
}

function calculateSidePosition(grid,side,i,j,startX,startY,size){

    let padding=2.5
    let sideLength=size*5;

    if(side==='top'){
        grid.targetPosition={
            x:((j*5)+startX),
            y:0,
            z:((i*5)+startY),

        }  
        grid.targetRotation={
            x:0,
            y:0,
            z:0
        }
    }

    if(side==='front'){
        grid.targetPosition={
            x:((j*5)+startX),
            y:((startY-(i*5))-startY)-padding,
            z:startY-padding,

        }  
        grid.targetRotation={
            x:Math.PI/2,
            y:0,
            z:0  
        }
    }

    if(side==='left'){
        grid.targetPosition={
            x:0-padding,
            y:((-sideLength+(j*5)))+padding,
            z:(i*5),
        }
        grid.targetRotation={
            x:0,
            y:0,
            z:Math.PI/2 
        }
    }
    if(side==='right'){
        grid.targetPosition={
            x:startX-padding, 
            y:(j*-5)-padding,
            z:(i*5),

        }
        grid.targetRotation={
            x:0,
            y:0,
            z:-Math.PI/2    
        }
    }
    if(side==='back'){
        grid.targetPosition={
            x:(j*5)+startX,
            y:-sideLength+(i*5)+padding,
            z:0-padding,

        }
        grid.targetRotation={
            x:-Math.PI/2,
            y:0,
            z:0     
        }
    }
    if(side==='bot'){
        grid.targetPosition={
            x:(j*5),
            y:-sideLength,
            z:sideLength-(i*5)-5,

        }
        grid.targetRotation={
            x:-Math.PI,
            y:0,
            z:0
        }
    }
}
