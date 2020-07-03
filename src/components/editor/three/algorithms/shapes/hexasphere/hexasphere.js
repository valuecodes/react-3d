
import * as THREE from 'three'
import { Vector3, VertexColors } from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import {calcuteDistance} from './../calculations'
import { extend, Canvas, useRender, useThree, useResource } from 'react-three-fiber'
import { func } from 'prop-types';

extend({ VertexNormalsHelper })


export function createHexasphere(options,group){

    let array=[];
    
    let geometry= new THREE.IcosahedronGeometry(options.size,4);
    let edgeGeometry= new THREE.IcosahedronGeometry(options.size,1);

    let positions=geometry.vertices
    let edgePositions=edgeGeometry.vertices

    let edges=getEdgeCoordinates(edgePositions,options)

    for(var i=0;i<positions.length;i++){
        let edge=checkIfEdge(positions[i],edges)
        array.push(new HexagonTile(options,positions[i],i,edge,group))
    }

    for(var i=0;i<array.length;i++){
        array[i].addNeighbors(array);
    }

    for(var i=0;i<array.length;i++){
        if(!array[i].edge){
            array[i].createHexagon(array[i]);        
        }   
    }
    
    return array
}
function HexagonTile(options,position,id,edge,group){
    this.center=position
    this.neigbors=[];
    this.id=id;
    this.edge=edge;
    this.options=options;
    this.quarter=getQuarter(this)
    this.seam=getSeam(this)
    this.color=''
    this.group=group
    this.hexagon=null;
    // let geometry= new  THREE.CircleGeometry()
    // this.material=new THREE.MeshStandardMaterial({color:'red',side:2})
    this.mesh=new THREE.Mesh()

    this.addNeighbors=(all)=>{

        let current=this.center;
        let newNeigbors=[]
        let maxDist=this.options.cellSize*3
        for(var i=0;i<all.length;i++){
            if(i===id) continue
            if(all[i]){
                let target=all[i].center
                let distance=current.distanceTo(target)
                if(distance<4.5){
                    newNeigbors.push(all[i])
                }             
            }

        }
        console.log(newNeigbors.length)
        this.neigbors=newNeigbors
    }
    
    this.createHexagon=(current)=>{
        current.hexagon=true
        // let cVertex=current.mesh.geometry.vertices
        let path=getPathFromNeighbors(current);

        // path=modifyPath(path,5,6)
        // path=modifyPath(path,6,5)

        var geometry = new THREE.Geometry();
        geometry.vertices.push(...path)
        console.log(geometry)
        var material = new THREE.MeshPhongMaterial( { color : '#262729',side:2 } );

        let normal=new THREE.Vector3( 1, 0, 0 );

        geometry.faces.push(
            new THREE.Face3(0,1,3) ,
            new THREE.Face3(5,0,3),            
            new THREE.Face3(1,2,3) ,
            new THREE.Face3(3,4,5) ,
        )
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        
        this.mesh.add(new THREE.Mesh( geometry, material ) )
        
        // for(var i=0;i<cVertex.length;i++){
        //     // let distance=cVertex.distanceTo(target)
        //     let nearest=getNearestNeighbor(current,cVertex[i])
        //     // path.push(nearest)
        //     console.log(current.mesh.geometry.vertices[i],nearest)
        //     current.mesh.geometry.vertices[i].x=nearest.x
        //     current.mesh.geometry.vertices[i].y=nearest.y
        //     current.mesh.geometry.vertices[i].z=nearest.z
        //     // current.mesh.geometry.verticesNeedUpdate=true
        // }   
        // console.log(current.color)
        // path=getPathFromNeighbors(current);
        var material = new THREE.LineBasicMaterial({color:'black'})
        // console.log(path)
        var geometry = new THREE.BufferGeometry().setFromPoints( path );
        
        var line = new THREE.Line( geometry, material );
        this.mesh.add( line );
    }

}

function modifyPath(path,a,b){
    let copy=path[a]
    path[a]=path[b]
    path[b]=copy
    return path
}

function lineCentroid(a,b){
    return new THREE.Vector3( ((a.x+b.x)/2), ((a.y+b.y)/2), ((a.z+b.z)/2) );
}

function getPathFromNeighbors(current){
    let path=[];
    let start=current.center;
    let hexStart;
    // path.push(start);


    for(var i=0;i<current.neigbors.length;i++){
        // if(!current.neigbors[i].edge){
            
            let target=current.neigbors[i].center
            current.neigbors[i].hexagon=false
            // if(path.length===1){
            //     hexStart=target
            //     // path.push(hexStart)  
            // }              
            
            path.push(target)         
        // }
    }
    // path.push(current.neigbors[0].center);

    let len=path.length
    for(var a=0;a<10;a++){
        for(var i=0;i<len;i++){
            let dist1=path[i].distanceTo(path[(i+1)%len])
            let dist2=path[i].distanceTo(path[(i+2)%len])
            if(dist2<dist1){
                path=modifyPath(path,(i+1)%len,(i+2)%len)
            }
        }
    }
    len=path.length
    let pathCopy=path[0]
    for(var i=0;i<path.length;i++){
        let index=i;
        
        // if(index===0) index=1
        let dist=current.center
        let dist1=path[index]
        let dist2;
        if(index+1==len){   
            dist2=pathCopy
        }else{
            dist2=path[index+1]
        }
        path[i]=getCentroid(dist,dist1,dist2)
        
    }

    return path
}

function getCentroid(a,b,c){
    return new THREE.Vector3( ((a.x+b.x+c.x)/3), ((a.y+b.y+c.y)/3), ((a.z+b.z+c.z)/3) ); 
}

function sortPath(path){


        

    
    // sortedPath=path.sort((a,b)=>a.distanceTo(b)+b.distanceTo(a));
    console.log(path)
    return path
}

function findNearest(path,current){
    let minDist=Infinity
    let closest;
    for(var a=1;a<path.length;a++){
        let dist=current.distanceTo(path[a])
        if(dist<minDist){
            closest=path[a]
        }
    }
    return closest
}

function getNearestNeighbor(current, cVertex){
    
    let nearest=50
    let found=null
    for(var i=0;i<current.neigbors.length;i++){
        let target=current.neigbors[i].mesh.position
    
        let distance=cVertex.distanceTo(target)
        if(distance<nearest) {
            found=target
            nearest=distance
        }
    }
    // console.log(found)
    return found;
}

function calculateNormals(faces){

    let normals=[];

    for(var i=0;i<faces.length;i++){

        let a=faces[i].a
        let b=faces[i].b
        let c=faces[i].c


        normals[a]=faces[i].vertexNormals[0]
        normals[b]=faces[i].vertexNormals[1]
        normals[c]=faces[i].vertexNormals[2]

    }
    return normals
}

function getSeam(tile){
    let pos=tile.center;
    
    let seam=null;
    if(pos.x===0){
        seam='x'
        // tile.color='dimgray'
        // tile.mesh.material.color.set('dimgray')
        // if(pos.y<0)
    }
    if(pos.y===0){
        seam='y'
        // tile.color='dimgray'
        // tile.mesh.material.color.set('dimgray')
    }
    if(pos.z===0){
        seam='z'
        // tile.color='dimgray'
        // tile.mesh.material.color.set('dimgray')
    }
    return seam
}

function getQuarter(tile){
    let pos=tile.center;
    let quarter=null;

    if(pos.x>0&&pos.y>0&&pos.z>0){
        quarter=0
        tile.color='yellow'
        // tile.mesh.material.color.set('yellow')
    }
    if(pos.x<0&&pos.y>0&&pos.z>0){
        quarter=2
        tile.color='blue'
        // tile.mesh.material.color.set('blue')
    }
    if(pos.x<0&&pos.y<0&&pos.z>0){
        quarter=5
        tile.color='yellow'
        // tile.mesh.material.color.set('brown')
    }  
    if(pos.x>0&&pos.y<0&&pos.z>0){
        quarter=3
        tile.color='yellow'
        // tile.mesh.material.color.set('seagreen')
    }

    if(pos.x>0&&pos.y>0&&pos.z<0){
        quarter=3
        tile.color='yellow'
        // tile.mesh.material.color.set('gold')
    }
    if(pos.x<0&&pos.y<0&&pos.z<0){
        quarter=1
        tile.color='yellow'
        // tile.mesh.material.color.set('green')
    }
    if(pos.x>0&&pos.y<0&&pos.z<0){
        quarter=4
        tile.color='yellow'
        // tile.mesh.material.color.set('purple')
    }
    if(pos.x<0&&pos.y>0&&pos.z<0){
        quarter=5
        tile.color='yellow'
        // tile.mesh.material.color.set('pink')
    }
    return quarter;
}


// function createCenterPosition(position){
//     console.log(position)
//     let color=edge?'black':'red'

//     // let geometry= new  THREE.CircleGeometry(options.cellSize,1)
//     // let material= new THREE.MeshStandardMaterial( {color:color,side:2} );
//     let mesh=new Vector3()
    
//     mesh.position.x=position.x
//     mesh.position.y=position.y
//     mesh.position.z=position.z

//     // mesh.lookAt(center)
//     // mesh.rotation.z=0.5
//     // let edge=false;

//     // if(mesh.quaternion._x===0&&mesh.quaternion._z===0) edge=true
//     // if(mesh.quaternion._x===0&&mesh.quaternion._y===0) edge=true
//     // if(mesh.quaternion._y===0&&mesh.quaternion._z===0) edge=true
//     // if(mesh.rotation.x===0&&mesh.rotation.z===0) edge=true
//     // if(mesh.rotation.x===0&&mesh.rotation.y===0) edge=true
//     // if(mesh.rotation.y===0&&mesh.rotation.z===0) edge=true
//     // if(mesh.rotation.y===0&&mesh.rotation.z===0&&mesh.rotation.x===0) edge=true
//     // if(mesh.quaternion._w===0) edge=true

//     // if(edge){
//     //     mesh.material.color.set('black')
//     // }

//     return mesh
// }

function checkIfEdge(current,edges){
    for(var a=0;a<edges.length;a++){
        if(JSON.stringify(current)===JSON.stringify(edges[a])){
            return true
        }
    }
    return false
}

function getEdgeCoordinates(positions,options){

    let edges=[];
    for(var i=0;i<positions.length;i++){
        let current=positions[i]
        let neigbors=[];
        for(var a=0;a<positions.length;a++){
            if(i===a) continue
            let target=positions[a]
            let distance=calcuteDistance(current,target)
            if(distance<options.size+1){
                neigbors.push(target)
            }
        }
        if(neigbors.length===5){
            edges.push(current)
        }
    }
    return edges;
}