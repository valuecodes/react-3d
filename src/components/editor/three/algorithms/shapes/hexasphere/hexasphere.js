
import * as THREE from 'three'
import { Vector3, VertexColors } from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import {calcuteDistance} from './../calculations'
import { extend, Canvas, useRender, useThree, useResource } from 'react-three-fiber'
import { func } from 'prop-types';

extend({ VertexNormalsHelper })


export function createHexasphere(options){

    let array=[];
    
    let geometry= new THREE.IcosahedronGeometry(options.size,3);
    let edgeGeometry= new THREE.IcosahedronGeometry(options.size,1);

    let positions=geometry.vertices
    let edgePositions=edgeGeometry.vertices

    let edges=getEdgeCoordinates(edgePositions,options)
    

    for(var i=0;i<positions.length;i++){

        let edge=checkIfEdge(positions[i],edges)

        array.push(new HexagonTile(options,positions[i],i,edge))
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
function HexagonTile(options,position,id,edge){
    this.mesh=createNewHexagonTile(options,position,edge)
    this.neigbors=[];
    this.id=id;
    this.edge=edge;
    this.options=options;
    this.quarter=getQuarter(this)
    this.seam=getSeam(this)
    this.color=''
    this.addNeighbors=(all)=>{

        let current=this.mesh.position;
        let newNeigbors=[]
        let maxDist=this.options.cellSize*3

        for(var i=0;i<all.length;i++){
            if(i===id) continue
            if(all[i]){
                let target=all[i].mesh.position
                let distance=current.distanceTo(target)
                if(distance<5){
                    newNeigbors.push(all[i])
                }             
            }

        }
        // console.log(newNeigbors.length)
        this.neigbors=newNeigbors
    }
    this.createHexagon=(current)=>{

        let cVertex=current.mesh.geometry.vertices
        let path=getPathFromNeighbors(current);
        
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
        var material = new THREE.LineBasicMaterial({color:'red'})
        // console.log(path)
        var geometry = new THREE.BufferGeometry().setFromPoints( path );
        
        var line = new THREE.Line( geometry, material );
        // console.log(this.mesh)
        this.mesh.add( line );
    }

}

function getPathFromNeighbors(current){
    let path=[];
    for(var i=0;i<current.neigbors.length;i++){
        let start=current.mesh.position;
        path.push(start);
        let target=current.neigbors[i].mesh.position
        path.push(target)
    }
    return path
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
    let pos=tile.mesh.position;
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
    let pos=tile.mesh.position;
    let quarter=null;

    if(pos.x>0&&pos.y>0&&pos.z>0){
        quarter=0
        tile.color='yellow'
        tile.mesh.material.color.set('yellow')
    }
    if(pos.x<0&&pos.y>0&&pos.z>0){
        quarter=2
        tile.color='blue'
        tile.mesh.material.color.set('blue')
    }
    if(pos.x<0&&pos.y<0&&pos.z>0){
        quarter=5
        tile.color='yellow'
        tile.mesh.material.color.set('brown')
    }  
    if(pos.x>0&&pos.y<0&&pos.z>0){
        quarter=3
        tile.color='yellow'
        tile.mesh.material.color.set('seagreen')
    }

    if(pos.x>0&&pos.y>0&&pos.z<0){
        quarter=3
        tile.color='yellow'
        tile.mesh.material.color.set('gold')
    }
    if(pos.x<0&&pos.y<0&&pos.z<0){
        quarter=1
        tile.color='yellow'
        tile.mesh.material.color.set('green')
    }
    if(pos.x>0&&pos.y<0&&pos.z<0){
        quarter=4
        tile.color='yellow'
        tile.mesh.material.color.set('purple')
    }
    if(pos.x<0&&pos.y>0&&pos.z<0){
        quarter=5
        tile.color='yellow'
        tile.mesh.material.color.set('pink')
    }
    return quarter;
}


function createNewHexagonTile(options,position,edge){

    let color=edge?'black':'red'

    // let geometry= new  THREE.CircleGeometry(options.cellSize,1)
    // let material= new THREE.MeshStandardMaterial( {color:color,side:2} );
    let mesh=new THREE.Mesh( );
    
    mesh.position.x=position.x
    mesh.position.y=position.y
    mesh.position.z=position.z

    let center= new THREE.Vector3(
        0,0,0
    )
    // mesh.lookAt(center)
    // mesh.rotation.z=0.5
    // let edge=false;

    // if(mesh.quaternion._x===0&&mesh.quaternion._z===0) edge=true
    // if(mesh.quaternion._x===0&&mesh.quaternion._y===0) edge=true
    // if(mesh.quaternion._y===0&&mesh.quaternion._z===0) edge=true
    // if(mesh.rotation.x===0&&mesh.rotation.z===0) edge=true
    // if(mesh.rotation.x===0&&mesh.rotation.y===0) edge=true
    // if(mesh.rotation.y===0&&mesh.rotation.z===0) edge=true
    // if(mesh.rotation.y===0&&mesh.rotation.z===0&&mesh.rotation.x===0) edge=true
    // if(mesh.quaternion._w===0) edge=true

    // if(edge){
    //     mesh.material.color.set('black')
    // }

    return mesh
}

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