import * as THREE from 'three'
import { Vector3, Geometry } from 'three';

export default function createNewCube(size){
    let sideLength=size*5;
    let cube={
        ...cubeSide(size,0,-sideLength*2,'bot'),
        ...cubeSide(size,0,-sideLength,'back'),
        ...cubeSide(size,0,sideLength,'front'),
        ...cubeSide(size,0,0,'top'),
        ...cubeSide(size,-sideLength,0,'left'),
        ...cubeSide(size,sideLength,0,'right'),
    }
    return cube
}

function cubeSide(size,startX,startY,side){

    let object={}

    for(var j=0;j<size;j++){
        for(var i=0;i<size;i++){

            let currentX=j+(startX/5)
            let currentZ=i+(startY/5)

            let gridCell=new GridCell(currentX,currentZ,i*j,size,side)

            gridCell.mesh.position.x=(j*5)+startX
            gridCell.mesh.position.z=(i*5)+startY

            let id=Number(currentX)+'.'+Number(currentZ)

            gridCell.id=id
            object[id]=gridCell
            gridCell.createWalls()
            gridCell.addNeighbors(gridCell,side)
            calculateSidePosition(gridCell,side,j,i,startX,startY,size);
        }
    }

    return object
}

function calculateSidePosition(grid,side,j,i,startX,startY,size){

    let padding=2.5

    let sideLength=size*5;


    if(side==='top'){
        grid.mesh.target=null;
    }

    if(side==='front'){
        grid.mesh.target={
            x:((j*5)+startX),
            y:((startY-(i*5))-startY)-padding,
            z:startY-padding,
            xRotation:Math.PI/2,
            yRotation:0,
            zRotation:0
        }  
    }

    if(side==='left'){
        grid.mesh.target={
            x:0-padding,
            y:((-sideLength+(j*5)))+padding,
            z:(i*5),
            xRotation:0,
            yRotation:0,
            zRotation:Math.PI/2
        }
    }
    if(side==='right'){
        grid.mesh.target={
            x:startX-padding, 
            y:(j*-5)-padding,
            z:(i*5),
            xRotation:0,
            yRotation:0,
            zRotation:-Math.PI/2
        }
    }
    if(side==='back'){
        grid.mesh.target={
            x:(j*5)+startX,
            y:-sideLength+(i*5)+padding,
            z:0-padding,
            xRotation:-Math.PI/2,
            yRotation:0,
            zRotation:0
        }
    }
    if(side==='bot'){
        grid.mesh.target={
            x:(j*5),
            y:-sideLength,
            z:sideLength-(i*5)-5,
            xRotation:-Math.PI,
            yRotation:0,
            zRotation:0
        }
    }
}

function GridCell(x,z,index,size,side){
    this.x=x;
    this.y=2;
    this.z=z;
    this.size=size;
    this.index=index;
    this.visited=false;
    this.id=null;
    this.side=side;
    this.neighbors=[];
    this.walls=[true, true, true, true];
    this.current=false;
    this.offSet=10;
    this.geometry= new THREE.BoxBufferGeometry( 5, 0.5, 5 );
    this.material= new THREE.MeshBasicMaterial( {color:'white'} );
    this.mesh=new THREE.Mesh( this.geometry, this.material);

    this.createWalls=()=>{
        let currentWalls=[];

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x,this.y,this.z-this.offSet],
                geometry:[6,1,1],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x+this.offSet,this.y,this.z],
                geometry:[1,1,6],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x,this.y,this.z+this.offSet],
                geometry:[6,1,1],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x-this.offSet,this.y,this.z],
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

    this.setWalls=(current)=>{
        current.mesh.children[0].visible=current.walls[0];
        current.mesh.children[1].visible=current.walls[1];
        current.mesh.children[2].visible=current.walls[2];
        current.mesh.children[3].visible=current.walls[3];
    }

    this.addNeighbors=(cell,side)=>{
        let neighbors=[];
        neighbors.push(cell.x+'.'+Number(cell.z+1));
        neighbors.push(cell.x+'.'+Number(cell.z-1));
        neighbors.push(Number(cell.x+1)+'.'+cell.z);
        neighbors.push(Number(cell.x-1)+'.'+cell.z);
        this.neighbors=neighbors
    }

    this.getNextNeigbor=(current,cubes)=>{
        let neighbors=[];
        let side=this.side;
        let size=this.size

        let top = cubes[this.neighbors[0]]
        let bottom = cubes[this.neighbors[1]]
        let right = cubes[this.neighbors[2]]
        let left = cubes[this.neighbors[3]]
    
        let id=current.id;
        id=id.split('.')

        if(top===undefined&&side==='front'){
            current.walls[2]=false
            let newId=(id[0])+'.-'+size*2
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }
        if(bottom===undefined&&side==='bot'){
            current.walls[0]=false
            let newId=(id[0])+'.'+size*2-1
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }
        if(top===undefined&&side==='left'){
            let newId=0+'.'+(Math.abs(id[0])+size-1)
            current.walls[2]=false
            cubes[newId].walls[3]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(left===undefined&&side==='front'){
            let newId=(id[1]-(size-1))*-1+'.'+size-1
            console.log(newId)
            current.walls[3]=false
            if(cubes[newId]) cubes[newId].walls[2]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(right===undefined&&side==='front'){
            let newId=id[1]+'.'+id[0]
            current.walls[1]=false
            cubes[newId].walls[2]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(top===undefined&&side==='right'){
            let newId=id[1]+'.'+id[0]
            current.walls[2]=false
            cubes[newId].walls[1]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(bottom===undefined&&side==='bot'){
            let newId=(id[1]*-1)+'.'+(size*2)-1
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(bottom===undefined&&side==='left'){
            let newId=id[1]+'.'+id[0]
            current.walls[0]=false
            cubes[newId].walls[3]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(bottom===undefined&&side==='left'){
            let newId=id[1]+'.'+id[0]
            current.walls[0]=false
            cubes[newId].walls[3]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(left===undefined&&side==='back'){
            let newId=id[1]+'.'+id[0]
            current.walls[3]=false
            cubes[newId].walls[0]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

        if(right===undefined&&side==='back'){
            let newId=(Math.abs(id[1])+(size-1))+'.'+0
            current.walls[1]=false
            cubes[newId].walls[0]=false
            if(cubes[newId]&&!cubes[newId].visited) neighbors.push(cubes[newId]);
        }

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
}
