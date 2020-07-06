import * as THREE from 'three'

export default function Tile(options,position,id,pentagon,distanceToNext){
    this.center=position
    this.neighbors=[];
    this.id=id;
    this.pentagon=pentagon;
    this.options=options;
    this.distanceToNext=distanceToNext
    this.faces=[];
    this.materialIndex=null;
    this.quarterName=getQuarterName(this,options)
    this.seam=getSeam(this,distanceToNext,options) 
    this.hexagon=null;
    this.qID=null;
    this.shape=null;
    this.mesh=null;
    this.mesh=null;
    this.visited=false;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.current = false;
    this.previous = null;
    this.setColor=(materialIndex)=>{
        let faces=this.faces;
        let meshFaces=this.mesh.geometry.faces
        for(var i = 0 ; i < faces.length; i++){
            meshFaces[faces[i]].materialIndex=materialIndex
        }
        // this.mesh.geometry.elementsNeedUpdate = true;
    }

    this.getNextNeighbor=(tiles)=>{
        let unvisitedNeighbors=[];
        let neighbors=this.neighbors
        for(var i=0;i<neighbors.length;i++){
            if(!neighbors[i].visited){
                unvisitedNeighbors.push(neighbors[i]);
            }
        }
        if(unvisitedNeighbors.length!==0){
            let random = Math.floor(Math.random()*unvisitedNeighbors.length);
            return unvisitedNeighbors[random].id
        }else{
            return null
        }
    }

    this.setWallColors=()=>{
        let walls=this.wallFaces.flat()
        let meshFaces=this.wallMesh.geometry.faces
        for(var i = 0 ; i < walls.length; i++){
            meshFaces[walls[i]].materialIndex=1
            this.walls[i]=false
        }
    }

    this.removeWall=(index)=>{
        let walls=this.wallFaces[index]
        let meshFaces=this.wallMesh.geometry.faces
        if(walls){
            for(var i = 0 ; i < walls.length; i++){
                meshFaces[walls[i]].materialIndex=2
                this.walls[i]=false
            }      
        }

    }

}

function getQuarterName(tile,options){

    let {
        colorScheme
    } = options

    let pos=tile.center;
    let quarterName=null;

    if(pos.x>0&&pos.y>0&&pos.z>0){
        quarterName='q1'
        tile.qID=1
        tile.materialIndex=0
        // console.log(tile)
        tile.color=colorScheme.q1
        // tile.mesh.material.color.set('yellow')
    }
    if(pos.x<0&&pos.y>0&&pos.z>0){
        quarterName='q2'
        tile.qID=2
        tile.materialIndex=1
        tile.color=colorScheme.q2
        // tile.mesh.material.color.set('blue')
    }
    if(pos.x<0&&pos.y<0&&pos.z>0){
        quarterName='q3'
        tile.qID=3
        tile.materialIndex=2
        tile.color=colorScheme.q3
        // tile.mesh.material.color.set('brown')
    }  
    if(pos.x>0&&pos.y<0&&pos.z>0){
        quarterName='q4'
        tile.qID=4
        tile.materialIndex=3
        tile.color=colorScheme.q4
        // tile.mesh.material.color.set('seagreen')
    }

    if(pos.x>0&&pos.y>0&&pos.z<0){
        quarterName='q5'
        tile.qID=5
        tile.materialIndex=4
        tile.color=colorScheme.q5
        // tile.mesh.material.color.set('gold')
    }
    if(pos.x<0&&pos.y<0&&pos.z<0){
        quarterName='q6'
        tile.qID=6
        tile.materialIndex=5
        tile.color=colorScheme.q6
        // tile.mesh.material.color.set('green')
    }
    if(pos.x>0&&pos.y<0&&pos.z<0){
        quarterName='q7'
        tile.qID=7
        tile.materialIndex=6
        tile.color=colorScheme.q7
        // tile.mesh.material.color.set('purple')
    }
    if(pos.x<0&&pos.y>0&&pos.z<0){
        quarterName='q8'
        tile.qID=8
        tile.materialIndex=7
        tile.color=colorScheme.q8
        // tile.mesh.material.color.set('pink')
    }
    return quarterName;
}

function getSeam(tile,distanceToNext,options){
    let colorScheme=options.colorScheme
    let pos=tile.center;
    // distanceToNext*=0.80
    distanceToNext*=options.detail===3?0.87:options.detail>5?2.1:0.8
    let seam=false;
    if(Math.abs(pos.x)<distanceToNext){
        seam='x'
        tile.color=colorScheme.seam
        tile.quarterName=null
        // tile.mesh.material.color.set('dimgray')
        // if(pos.y<0)
    }
    if(Math.abs(pos.y)<distanceToNext){
        seam='y'
        tile.color=colorScheme.seam
        tile.quarterName=null
        // tile.color='gray'
        // tile.mesh.material.color.set('dimgray')
    }
    if(Math.abs(pos.z)<distanceToNext){
        seam='z'
        tile.color=colorScheme.seam
        tile.quarterName=null
        // tile.color='gray'
        // tile.mesh.material.color.set('dimgray')
    }
    return seam
}
