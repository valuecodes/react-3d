import * as THREE from 'three'
import { Vector3, Geometry } from 'three';

export default function Cell(x,z,index,rows,cols){
    this.x=x;
    this.y=2;
    this.z=z;
    this.index=index;
    this.visited=false;
    this.rows=rows;
    this.cols=cols;
    this.neighbors=[];
    this.walls=[true, true, true, true];
    this.current=false;
    this.offSet=10;
    this.f=0;
    this.g=0;
    this.h=0;
    this.geometry= new THREE.BoxGeometry( 5, 1, 5 );
    this.material= new THREE.MeshBasicMaterial( {color:'#262729'} );
    this.mesh=new THREE.Mesh( this.geometry, this.material);

    this.createWalls=()=>{
        let currentWalls=[];

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x,this.y,this.z-this.offSet],
                geometry:[6,2,1],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x+this.offSet,this.y,this.z],
                geometry:[1,2,6],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x,this.y,this.z+this.offSet],
                geometry:[6,2,1],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x-this.offSet,this.y,this.z],
                geometry:[1,2,6],
                pos:'left'
            })            
        }

        currentWalls.map(wall=>{

            let geo = new THREE.BoxGeometry( ...wall.geometry )
            let mat =  new THREE.MeshStandardMaterial( {color:'#1a1a1a'} );
            let wall1=new THREE.Mesh( geo, mat);
            wall1.position.x=wall1.position.x+(wall.pos==='right'?2.5:wall.pos==='left'?-2.5:0);
            wall1.position.z=wall1.position.z+(wall.pos==='top'?-2.5:wall.pos==='bot'?2.5:0);
            this.mesh.add(wall1);
        
        })

    }

    this.getIndex=(i, j)=>{
        if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
        return -1;
        }
        return i + j * this.cols;
    }

    this.setWalls=(current)=>{
        current.mesh.children[0].visible=current.walls[0];
        current.mesh.children[1].visible=current.walls[1];
        current.mesh.children[2].visible=current.walls[2];
        current.mesh.children[3].visible=current.walls[3];
    }

    this.getNextNeighbor=()=>{
        let notVisited=this.neighbors.filter(neighbor => !neighbor.visited)
        if (notVisited.length > 0) {
            let r = Math.floor(Math.random()*notVisited.length);
            return notVisited[r];
        } else return undefined; 
    }

    this.addNeigbors=(grid)=>{
        let i=this.z;
        let j=this.x;
        let neighbors=[];
        let top = grid[this.getIndex(i, j - 1)];
        let right = grid[this.getIndex(i + 1, j)];
        let bottom = grid[this.getIndex(i, j + 1)];
        let left = grid[this.getIndex(i - 1, j)];

        if (top) {
            neighbors.push(top);
        }
        if (right) {
        neighbors.push(right);
        }
        if (bottom) {
        neighbors.push(bottom);
        }
        if (left) {
        neighbors.push(left);
        }
        this.neighbors=neighbors
    }
}



  