import * as THREE from 'three'
import { Vector3 } from 'three';

let rows=10;
let cols=10;

export default function Cell(x,z,index1){
    this.x=x;
    this.y=2;
    this.z=z;
    this.index1=index1;
    this.offSet=2.5;
    this.visited=false;
    this.walls=[true, true, true, true];
    this.current=false;
    this.getPosition=()=>{
        return [this.x*5,this.y,this.z*5]
    }

    this.getWalls=()=>{
        let currentWalls=[];

        if(this.walls[0]){
            currentWalls.push({
                position:[this.x*5,this.y,this.z*5-this.offSet],
                geometry:[5,2,1],
                pos:'top'
            })
        }
        if(this.walls[1]){
            currentWalls.push({
                position:[this.x*5+this.offSet,this.y,this.z*5],
                geometry:[1,2,5],
                pos:'right'
            })
        }
        if(this.walls[2]){
            currentWalls.push({
                position:[this.x*5,this.y,this.z*5+this.offSet],
                geometry:[5,2,1],
                pos:'bot'
            })            
        }
        if(this.walls[3]){
            currentWalls.push({
                position:[this.x*5-this.offSet,this.y,this.z*5],
                geometry:[1,2,5],
                pos:'left'
            })            
        }
        return currentWalls
    }    
    
    this.checkNeigbors=(grid)=>{
        let i=this.z;
        let j=this.x;
        let neighbors=[];
        let top = grid[index(i, j - 1)];
        let right = grid[index(i + 1, j)];
        let bottom = grid[index(i, j + 1)];
        let left = grid[index(i - 1, j)];

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

function index(i, j) {
    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
      return -1;
    }
    return i + j * cols;
  }

  