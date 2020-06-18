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
    this.geometry= new THREE.BoxGeometry( 5, 1, 5 );
    this.material= new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    this.mesh=new THREE.Mesh( this.geometry, this.material);

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



  