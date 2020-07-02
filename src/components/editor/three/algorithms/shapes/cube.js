import * as THREE from 'three'
import { Vector3, Geometry } from 'three';
import { func } from 'prop-types';
import {
    calculateCubeFormation,
    calculateOpenFormation,
    calculateStartingFormation
}from './formations'
import {
    setObstacles
} from './calculations'
import { 
    setCubePosition
}from './../../../../../utils/other/calculatePosition'

export default function createNewCube(options){

    let cubeSides=createCubeSides(options)
    let cells=setCellOptions(cubeSides,options)

    return [cells, cubeSides]
}

function createCubeSides(options){
    
    const {
        size,
        cellSize,
        cubeSides
    } = options

    let sideLength=size*cellSize;
    let sides=[];

    let sidesInfo=[
        [size,cellSize,0,0,'top',0,[1,2,4,3], options],
        [size,cellSize,sideLength,0,'right',2,[1,5,4,0], options],
        [size,cellSize,0,sideLength,'front',4,[0,2,5,3], options],
        [size,cellSize,-sideLength,0,'left',3,[1,0,4,5], options],
        [size,cellSize,0,-sideLength,'back',1,[5,2,0,3], options],
        [size,cellSize,0,-sideLength*2,'bot',5,[4,2,1,3], options],
    ]

    for(var i=0;i<6;i++){
        if(cubeSides[sidesInfo[i][4]]){
            sides.push(new CubeSide(...sidesInfo[i]))
        }
    }

    return sides
}

function CubeSide(size,cellSize,startingX, startingZ, side, sideID,neighborSides,options){
    this.size=size;
    this.cellSize=cellSize
    this.cells=addCells(size,cellSize,startingX, startingZ, side, sideID,neighborSides,options);
    this.side=side;
    this.sideID=sideID;
    this.neighborSides=neighborSides;
}


function addCells(size,cellSize,startingX, startingZ, side, sideID,neighborSides,options){
    
    let newCells={};
    for(var y=0;y<size;y++){    
        for(var x=0;x<size;x++){

            let id=`${sideID}.${x}.${y}`

            let newCell=new Cell(
                x,
                y,
                size,
                cellSize,
                side,
                sideID,
                neighborSides,
                id,
                startingX, 
                startingZ,
                options
            )

            newCells[id]=newCell;

        }
    }
    return newCells
}

function Cell(x,y,size,cellSize,side,sideID,neighborSides, id, startingX, startingZ,options){
    
    this.x = x
    this.y = y
    this.size = size
    this.cellSize = cellSize
    this.side = side
    this.sideID = sideID;
    this.neighborSides = neighborSides
    this.id = id;
    this.edge = checkEdge(x,y,size-1);
    
    this.cubeEdge = checkCubeEdge(y,x,size-1)
    this.neighbors = addNeighbors(this,sideID,size,options);
    this.obstacle = false
    this.walls=[true, true, true, true];
    this.visited=false;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.current = false;
    this.options = options;    
    this.startingFormation = calculateStartingFormation(x,y,startingX,startingZ,cellSize)     
    this.openFormation = calculateOpenFormation(x,y,startingX,startingZ,cellSize)
    this.cubeFormation = calculateCubeFormation(x,y,startingX,startingZ,side,size,cellSize)
    this.targetFormation = this.cubeFormation
    this.mesh = addMesh(this,options)
    if(!options.animation){
       this.startingFormation = this.cubeFormation
    }


    this.setObstacle=(cellSize)=>{
        let colorScheme=this.options.colorScheme;
        this.obstacle=true;        
        // let geometry= new THREE.IcosahedronBufferGeometry( cellSize, 0 );
        // let material= new THREE.MeshStandardMaterial( {color:'black'} );
        // let mesh=new THREE.Mesh( geometry, material);
        // mesh.scale.y=0.5
        this.mesh.scale.y=2
        // this.mesh.add(mesh)
        this.mesh.material.color.set(colorScheme.obstacle)
    }

    this.addEdgeNeigbors=(current,cubes,sides,cellSize)=>{
        
        let neighbors=[];
        let side=this.side;
        let size=this.size

        let top = cubes[this.neighbors[0]]
        let bottom = cubes[this.neighbors[2]]
        let right = cubes[this.neighbors[1]]
        let left = cubes[this.neighbors[3]]

        let cubeEdge=this.cubeEdge;

        if(current.edge===0||cubeEdge===1||cubeEdge===0){
            top=calculateTop(current,cubes,sides,cellSize);
            if(top) this.neighbors[0]=top.id
        }

        if(current.edge===2||cubeEdge===2||cubeEdge===3){
            bottom=calculateBot(current,cubes,sides,cellSize);
            if(bottom) this.neighbors[2]=bottom.id
        }

        if(current.edge===3||cubeEdge===0||cubeEdge===3){
            left=calculateLeft(current,cubes,sides,cellSize);
            if(left) this.neighbors[3]=left.id
        }
        
        if(current.edge===1||cubeEdge===1||cubeEdge===2){
            right=calculateRight(current,cubes,sides,cellSize);
            if(right) this.neighbors[1]=right.id
        }

    }

    this.getNextNeigbor=(current,cubes,sides,stack)=>{

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

    this.setEndPoint=()=>{
        this.obstacle=false
        this.mesh.scale.y=1
        this.mesh.material.color.set( this.options.colorScheme.initial )
        let geometry= new  THREE.OctahedronBufferGeometry(this.cellSize/2)
        let material= new THREE.MeshStandardMaterial( {color:'red'} );
        let mesh=new THREE.Mesh( geometry, material);
        this.mesh.add(mesh)
    }
    this.setStartPoint=()=>{
        this.obstacle=false
        this.mesh.scale.y=1
        this.mesh.material.color.set( this.options.colorScheme.initial )
        let geometry= new  THREE.OctahedronBufferGeometry(this.cellSize/2)
        let material= new THREE.MeshStandardMaterial( {color:'green'} );
        let mesh=new THREE.Mesh( geometry, material);
        this.mesh.add(mesh)
    }

    this.setWalls=(current)=>{
        current.mesh.children[0].visible=current.walls[0];
        current.mesh.children[1].visible=current.walls[1];
        current.mesh.children[2].visible=current.walls[2];
        current.mesh.children[3].visible=current.walls[3];
    }

    this.createWalls=(options)=>{

        const {
            wallsVisible,
            colorScheme
        } = options
        
        let currentWalls=[];
        let length=this.cellSize*1.1
        let width=0.6
        let offSet=this.cellSize/2

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[length,width,width],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[width,width,length],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[length,width,width],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x,this.y,this.z],
                geometry:[width,width,length],
                pos:'left'
            })            
        }

        currentWalls.map(wall=>{
                let geo = new THREE.BoxBufferGeometry( ...wall.geometry )
                let mat =  new THREE.MeshBasicMaterial( {color:colorScheme.wall, visible:wallsVisible } );
                let wall1=new THREE.Mesh( geo, mat);
                wall1.position.x=wall1.position.x+(wall.pos==='right'?offSet:wall.pos==='left'?-offSet:0);
                wall1.position.z=wall1.position.z+(wall.pos==='top'?-offSet:wall.pos==='bot'?offSet:0);
                this.mesh.add(wall1);
        })
    }

}

function addCubeEdges(cubeSides,cells,size,cellSize){
    for(var i=0;i<cubeSides.length;i++){
        let keys=Object.keys(cubeSides[i].sideEdges)
        for(var a=0;a<keys.length;a++){
            cubeSides[i].sideEdges[keys[a]].addEdgeNeigbors(cubeSides[i].sideEdges[keys[a]],cells,cubeSides,cellSize)
        }
    } 
}

function setCellOptions(cubeSides,options){

    const {
        size,
        cellSize,
        obstacles,
        walls,
        wallsVisible,

    } = options;

    for(var i=0;i<cubeSides.length;i++){
        cubeSides[i].sideEdges={};
        let keys=Object.keys(cubeSides[i].cells)
        for(var a=0;a<keys.length;a++){
            if(cubeSides[i].cells[keys[a]].edge!==null){
                cubeSides[i].sideEdges[keys[a]]=cubeSides[i].cells[keys[a]];
            }

            if(obstacles){
                setObstacles(cubeSides[i].cells,keys,a,size,cellSize,options)
            }

            if(walls){
                cubeSides[i].cells[keys[a]].createWalls(options);
            }

        }
    }

    let cells={}

    cubeSides.forEach( side => cells={...cells,...side.cells})

    addCubeEdges(cubeSides,cells,size,cellSize)

    if(!options.animation){
        setCubePosition(cells)
    }
    return cells
}
function checkEdge(x,y,size){
    let edge=null;
    if(x===0) edge=3;
    if(y===0) edge=0;
    if(x===size) edge=1;
    if(y===size) edge=2;
    return edge
}

function checkCubeEdge(y,x,size){
    let cubeEdge=null
    if(y===0&&x===0) cubeEdge=0
    if(y===0&&x===size) cubeEdge=1
    if(y===size&&x===0) cubeEdge=3
    if(y===size&&x===size) cubeEdge=2
    return cubeEdge
}

function addMesh(cell,options){

    const {
        size,
        cellSize,
        colorScheme
    } = options

    let geometry = new THREE.BoxBufferGeometry( cellSize, 0.5, cellSize );
    let material = new THREE.MeshStandardMaterial( {color:colorScheme.initial});
    let mesh = new THREE.Mesh( geometry, material);

    if(options.animation){
        mesh.position.x=(size*cellSize)/2;
        mesh.position.y=-2;
        mesh.position.z=(size*cellSize)/2;

        mesh.rotation.x=-10+(Math.random()*20);
        mesh.rotation.y=-10+(Math.random()*20);
        mesh.rotation.z=-10+(Math.random()*20);        
    }else{
        mesh.position.x=cell.cubeFormation.position.x
        mesh.position.y=cell.cubeFormation.position.x
        mesh.position.z=cell.cubeFormation.position.x

        mesh.rotation.x=0;
        mesh.rotation.y=0;
        mesh.rotation.z=0;  
    }
    return mesh
}

function addNeighbors(cell,sideID,size,options){
    let neighbors=[];

    if(cell.y-1<0) neighbors.push(null)
    else neighbors.push(sideID+'.'+cell.x+'.'+Number(cell.y-1));

    if(cell.x+1>size) neighbors.push(null)
    else neighbors.push(sideID+'.'+Number(cell.x+1)+'.'+cell.y);

    if(cell.y+1>size) neighbors.push(null)
    else neighbors.push(sideID+'.'+cell.x+'.'+Number(cell.y+1));

    if(cell.x-1<0) neighbors.push(null)
    else neighbors.push(sideID+'.'+Number(cell.x-1)+'.'+cell.y);

    if(options.fullNeighbors){
        neighbors.push(sideID+'.'+Number(cell.x+1)+'.'+Number(cell.y+1))
        neighbors.push(sideID+'.'+Number(cell.x-1)+'.'+Number(cell.y+1))
        neighbors.push(sideID+'.'+Number(cell.x+1)+'.'+Number(cell.y-1))
        neighbors.push(sideID+'.'+Number(cell.x-1)+'.'+Number(cell.y-1))        
    }
    return neighbors
}


function calculateTop(current,cubes,sides,cellSize){

    let id=`${current.neighborSides[0]}.${current.x}.${current.size-1}`

    if(cubes[id]){
        let start=current.cubeFormation.position
        let end=cubes[id].cubeFormation.position
        let distance=calcuteDistance(start, end) 
        if(distance>5) id = calculateFromDistance(current,sides,cubes,cellSize)     
    }

    current.walls[0]=false
    return cubes[id]
}

function calculateBot(current,cubes,sides,cellSize){

    let id=`${current.neighborSides[2]}.${current.x}.${0}`
   
    if(cubes[id]){    
        let start=current.cubeFormation.position
        let end=cubes[id].cubeFormation.position
        let distance=calcuteDistance(start, end) 
        if(distance>5) id = calculateFromDistance(current,sides,cubes,cellSize)     
    }
    
    current.walls[2]=false
    return cubes[id]
}
function calculateLeft(current,cubes,sides,cellSize){

    let id=`${current.neighborSides[3]}.${current.size-1}.${current.y}`

    if(cubes[id]){    
        let start=current.cubeFormation.position
        let end=cubes[id].cubeFormation.position
        let distance=calcuteDistance(start, end) 
        if(distance>5) id = calculateFromDistance(current,sides,cubes,cellSize)    
    }

    current.walls[3]=false
    return cubes[id]
}
function calculateRight(current,cubes,sides,cellSize){

    let id=`${current.neighborSides[1]}.${0}.${current.y}`

    if(cubes[id]){    
        let start=current.cubeFormation.position
        let end=cubes[id].cubeFormation.position
        let distance=calcuteDistance(start, end) 
        if(distance>5) id = calculateFromDistance(current,sides,cubes,cellSize)    
    }

    current.walls[1]=false
    return cubes[id]
}

function calculateFromDistance(current,sides,cubes,cellSize){

    let cTarget=current.cubeFormation.position
    let targetSide=sides.filter(side=>side.sideID===current.neighborSides[current.edge])

    if(targetSide[0]){
        
        let cells=targetSide[0].sideEdges
        let found=null;
        let keys=Object.keys(cells);

        for(var i=0;i<keys.length-1;i++){
            let aTarget=cells[keys[i]].cubeFormation.position
            let distance=calcuteDistance(cTarget,aTarget)
            if(distance<cellSize*1.1) {
                found=keys[i]
                break
            }
        }

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
