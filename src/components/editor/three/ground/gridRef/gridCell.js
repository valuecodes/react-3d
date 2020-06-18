import * as THREE from 'three'
import { Vector3, Geometry } from 'three';

let rows=10;
let cols=10;

function getIndex(i, j) {
    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
      return -1;
    }
    return i + j * cols;
  }

export default function GridCell(x,z,index){
    this.x=x;
    this.y=2;
    this.z=z;
    this.index=index;
    this.visited=false;
    this.walls=[true, true, true, true];
    this.current=false;
    this.offSet=10;
    this.geometry= new THREE.BoxGeometry( 5, 1, 5 );
    this.material= new THREE.MeshBasicMaterial( {color:'orange'} );
    this.mesh=new THREE.Mesh( this.geometry, this.material);

    this.createWalls=()=>{
        let currentWalls=[];

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x,this.y,this.z-this.offSet],
                geometry:[5,2,1],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x+this.offSet,this.y,this.z],
                geometry:[1,2,5],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x,this.y,this.z+this.offSet],
                geometry:[5,2,1],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x-this.offSet,this.y,this.z],
                geometry:[1,2,5],
                pos:'left'
            })            
        }

        currentWalls.map(wall=>{

                let geo = new THREE.BoxGeometry( ...wall.geometry )
                let mat =  new THREE.MeshStandardMaterial( {color:'green'} );
                let wall1=new THREE.Mesh( geo, mat);
                wall1.position.x=wall1.position.x+(wall.pos==='right'?2.5:wall.pos==='left'?-2.5:0);
                wall1.position.z=wall1.position.z+(wall.pos==='top'?-2.5:wall.pos==='bot'?2.5:0);
                this.mesh.add(wall1);
            // <mesh
            //     // position={position} 
            //     scale={[1, 1, 1]}
            // >
            //     <boxBufferGeometry attach="geometry" args={geometry} />
            //     <meshStandardMaterial attach="material" color={'gray'} />
            // </mesh>
        
        })

    }

    this.setWalls=(current)=>{
        current.mesh.children[0].visible=current.walls[0];
        current.mesh.children[1].visible=current.walls[1];
        current.mesh.children[2].visible=current.walls[2];
        current.mesh.children[3].visible=current.walls[3];
        console.log(current);
    }

    this.checkNeigbors=(grid)=>{
        let i=this.z;
        let j=this.x;
        let neighbors=[];
        let top = grid[getIndex(i, j - 1)];
        let right = grid[getIndex(i + 1, j)];
        let bottom = grid[getIndex(i, j + 1)];
        let left = grid[getIndex(i - 1, j)];

        if (top && !top.visited) {
            neighbors.push(top);
        }
        if (right && !right.visited) {
        neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
        neighbors.push(bottom);
        }
        if (left && !left.visited) {
        neighbors.push(left);
        }
        if (neighbors.length > 0) {
        let r = Math.floor(Math.random()*neighbors.length);
        // console.log(Math.random(neighbors.length)*10)
        return neighbors[r];
        } else {
        return undefined;
        }
    }
}



  