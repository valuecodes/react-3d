import * as THREE from 'three'
import { Vector3, Geometry, OctahedronBufferGeometry } from 'three';

export default function Cell(x,z,index,rows,cols){
    this.x=x;
    this.y=2;
    this.z=z;
    this.index=index;
    this.visited=false;
    this.rows=rows;
    this.cols=cols;
    this.neighbors=[];
    this.current=false;
    this.wall=false;
    this.offSet=10;
    this.f=0;
    this.g=0;
    this.h=0;
    this.geometry= new THREE.BoxBufferGeometry( 4, 1, 4 );
    this.material= new THREE.MeshBasicMaterial( {color:'gainsboro'} );
    this.mesh=new THREE.Mesh( this.geometry, this.material);

    this.getIndex=(i, j)=>{
        if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
        return -1;
        }
        return i + j * this.cols;
    }

    this.addWall=(grid)=>{
        this.wall=true;        
        let geometry= new THREE.IcosahedronBufferGeometry( 2.8, 0 );
        let material= new THREE.MeshBasicMaterial( {color:'black'} );
        let mesh=new THREE.Mesh( geometry, material);
        this.material.visible=false
        this.mesh.add(mesh)
    }

    this.addMiddleWall=(grid,index)=>{
        let i=this.z;
        let j=this.x;
        let neighbors=[];
        let bot = grid[this.getIndex(i + 1, j)];
        let bot2 =  grid[this.getIndex(i + 2, j)];;

        if(bot && bot2){
            this.wall=true;        
            let geometry= new THREE.BoxBufferGeometry( 5, 1.1, 10);
            let material= new THREE.MeshBasicMaterial( {color:'black'} );
            let mesh=new THREE.Mesh( geometry, material);
            mesh.position.z=5
            this.mesh.add(mesh)              
        }
          
    }

    this.addNeigbors=(grid)=>{
        let i=this.z;
        let j=this.x;
        let neighbors=[];
        let top = grid[this.getIndex(i, j - 1)];
        let topR = grid[this.getIndex(i+1, j - 1)];
        let topL = grid[this.getIndex(i-1, j - 1)];
        let right = grid[this.getIndex(i + 1, j)];
        let bottom = grid[this.getIndex(i, j + 1)];
        let bottomR = grid[this.getIndex(i+1, j + 1)];
        let bottomL = grid[this.getIndex(i-1, j + 1)];
        let left = grid[this.getIndex(i - 1, j)];

        if (top) {
            neighbors.push(top);
        }
        if (topL) {
            neighbors.push(topL);
        }
        if (topR) {
            neighbors.push(topR);
        }
        if (right) {
        neighbors.push(right);
        }
        if (bottom) {
        neighbors.push(bottom);
        }
        if (bottomR) {
        neighbors.push(bottomR);
        }
        if (bottomL) {
        neighbors.push(bottomL);
        }
        if (left) {
        neighbors.push(left);
        }
        this.neighbors=neighbors
    }
}



  