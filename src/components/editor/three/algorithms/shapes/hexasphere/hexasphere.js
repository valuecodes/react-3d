
import * as THREE from 'three'
import { Vector3, VertexColors } from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import {calcuteDistance} from './../calculations'
import { extend, Canvas, useRender, useThree, useResource } from 'react-three-fiber'
import { func } from 'prop-types';

extend({ VertexNormalsHelper })


export function createHexasphere(options,group){

    let array=[];

    let geometry= new THREE.IcosahedronGeometry(options.size,options.detail);
    let pentagonGeometry= new THREE.IcosahedronGeometry(options.size,1);

    let positions=geometry.vertices
    let pentagonPositions=pentagonGeometry.vertices
    let pentagons=getPentagonCoordinates(pentagonPositions,options)

    let hexaSphere={
        q1:[],
        q2:[],
        q3:[],
        q4:[],
        q5:[],
        q6:[],
        q7:[],
        q8:[],
        seam:[],
        pentagon:[]
    }

    let distanceToNext=positions[0].distanceTo(positions[1])

    for(var i=0;i<positions.length;i++){
        
        let pentagon=checkIfPentagon(positions[i],pentagons)
        
        array.push(
            new HexagonTile(options,positions[i],i,pentagon,group,distanceToNext)
        )

        if(array[i].semiQuarter){
            array[i].qID=hexaSphere[array[i].semiQuarter].length
            hexaSphere[array[i].semiQuarter].push(array[i])
        }
        if(array[i].seam){
            hexaSphere.seam.push(array[i])
        }
        if(array[i].pentagon){
            hexaSphere.pentagon.push(array[i])
        }
    }  

    let seamNeighbors=[];
    
    for(var q=1;q<=8;q++){
        let semiQuarter=hexaSphere[`q${q}`]
        let sNeighbors=addQuarterNeighbors(semiQuarter,array,options,distanceToNext,hexaSphere)
        seamNeighbors=[...seamNeighbors,...sNeighbors]
        console.log(q+' Ready')
    }

    let seam=hexaSphere.seam
    let totalSeam=[...seam,...seamNeighbors]

    for(var i=0;i<seam.length;i++){
        searchNeigborsFrom(seam[i],array,distanceToNext)
    }
    console.log(hexaSphere)

    for(var i=0;i<array.length;i++){
        if(!array[i].pentagon){
            array[i].createHexagon(array[i]);        
        }   
        if(array[i].pentagon){
            array[i].createPentagon(array[i],options);   
        }
    }
    
    return array
}

function searchNeigborsFrom(current,section,dist){

    let newNeigbors=current.neigbors;
    let curCenter=current.center
    
    for(var i=0;i<section.length;i++){
        if(section[i]){
            let target=section[i].center
            let distance=curCenter.distanceTo(target)
            if(distance<0.1){
                continue
            }
            if(distance<dist*1.40){
                newNeigbors.push(section[i])
                if(newNeigbors.length===6){
                    current.neigborsFound=true
                    break
                }
            }             
        }
    }

    return newNeigbors
}

function addQuarterNeighbors(semiQuarter,array,options,distanceToNext,hexaSphere){
    
    let {
        size,
        detail
    } =options   

    let seamNeighbors=[];

    for(var i=0;i<semiQuarter.length;i++){
        let current=semiQuarter[i];
        let currentNeigbors=searchNeigborsFrom(current,semiQuarter,distanceToNext)
        if(currentNeigbors.length===6){
            current.neigbors=currentNeigbors
        }else{
            seamNeighbors.push(current)
            let seam=hexaSphere.seam
            let currentNeigbors=searchNeigborsFrom(current,seam,distanceToNext)
            current.neigbors=currentNeigbors
        }
    }
    return seamNeighbors
}

function createId(options,current,hexaSphere){
    let semiQuarter=current.semiQuarter;
    let xedge=new THREE.Vector3(25,0,0);
    let x=Math.floor(xedge.distanceTo(current.center))
    let yedge=new THREE.Vector3(0,25,0);
    let y=Math.floor(yedge.distanceTo(current.center))
    // let zedge=new THREE.Vector3(0,0,25);
    // let z=Math.floor(zedge.distanceTo(current.center))
    return `${semiQuarter}.${x}.${y}`
}

function HexagonTile(options,position,id,pentagon,group,distanceToNext){
    this.center=position
    this.neigbors=[];
    this.id=id;
    this.pentagon=pentagon;
    this.options=options;
    this.color='gray'    
    this.distanceToNext=distanceToNext
    this.setColor=(color)=>{
        this.color=color
    } 
    this.semiQuarter=getSemiQuarter(this,options)
    this.seam=getSeam(this,distanceToNext,options) 
    this.group=group
    this.hexagon=null;
    this.quarterID=null;
    this.neigborsFound=false;
    this.mesh=new THREE.Mesh()

    this.addNeighbors=(all,dist,hexaSphere)=>{

        let {
            size,
            detail
        } = this.options
        let current=this.center;
        let semiq=this.semiQuarter;
        let neighbors
        let newNeigbors=[]
        
        for(var i=0;i<all.length;i++){
            if(all[i]){
                let target=all[i].center
                let distance=current.distanceTo(target)
                if(distance<0.1){
                    // currentIndex=i
                    continue
                }
                if(distance<dist*1.4){
                    newNeigbors.push(all[i])
                }             
            }

        }
        // console.log(newNeigbors.length)
        this.neigbors=newNeigbors
    }
    
    this.createPentagon=(current,options)=>{
        let colorScheme=options.colorScheme
        let path=getPathFromNeighbors(current);
        var geometry = new THREE.Geometry();
        geometry.vertices.push(...path)
        var material = new THREE.MeshPhongMaterial( { color : colorScheme.pentagon,side:2 } );

        geometry.faces.push(
            new THREE.Face3(0,1,3),
            new THREE.Face3(1,2,3),
            new THREE.Face3(3,4,0),
        )

        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.mesh.add(new THREE.Mesh( geometry, material ) )

        createWalls(path,this.mesh);
        this.walls=[true,true,true,true,true,true]

    }

    this.createHexagon=(current)=>{
        current.hexagon=true
        let path=getPathFromNeighbors(current);
        let col=this.color
        var geometry = new THREE.Geometry();
        geometry.vertices.push(...path)
        // console.log(geometry)
        var material = new THREE.MeshPhongMaterial( { color : col,side:2 } );

        let normal=new THREE.Vector3( 1, 0, 0 );

        geometry.faces.push(
            new THREE.Face3(0,1,3),
            new THREE.Face3(5,0,3),            
            new THREE.Face3(1,2,3) ,
            new THREE.Face3(3,4,5) ,
        )
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.mesh.add(new THREE.Mesh( geometry, material ) )

        createWalls(path,this.mesh);
        this.walls=[true,true,true,true,true,true]

    }

}


function createWalls(path,mesh){
    let walls=[];
    for(var i=0;i<path.length;i++){
        walls.push([path[i],path[(i+1)%path.length]])
    }

    for(var i=0;i<walls.length;i++){
        var material = new THREE.LineBasicMaterial({color:'red'})
        var geometry = new THREE.BufferGeometry().setFromPoints( walls[i] );
        var wall = new THREE.Line( geometry, material );
        mesh.add( wall );
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

    for(var i=0;i<current.neigbors.length;i++){
        let target=current.neigbors[i].center
        current.neigbors[i].hexagon=false
        path.push(target)         
        
    }

    let len=path.length
    for(var a=0;a<2;a++){
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

function getSeam(tile,distanceToNext,options){
    let colorScheme=options.colorScheme
    let pos=tile.center;
    distanceToNext*=0.80
    // distanceToNext*=0.6
    let seam=false;
    if(Math.abs(pos.x)<distanceToNext){
        seam='x'
        tile.color=colorScheme.seam
        tile.semiQuarter=false
        // tile.mesh.material.color.set('dimgray')
        // if(pos.y<0)
    }
    if(Math.abs(pos.y)<distanceToNext){
        seam='y'
        tile.color=colorScheme.seam
        tile.semiQuarter=false
        // tile.color='gray'
        // tile.mesh.material.color.set('dimgray')
    }
    if(Math.abs(pos.z)<distanceToNext){
        seam='z'
        tile.color=colorScheme.seam
        tile.semiQuarter=false
        // tile.color='gray'
        // tile.mesh.material.color.set('dimgray')
    }
    return seam
}

function getSemiQuarter(tile,options){

    let {
        colorScheme
    } = options

    let pos=tile.center;
    let semiQuarter=false;

    if(pos.x>0&&pos.y>0&&pos.z>0){
        semiQuarter='q1'
        // console.log(tile)
        tile.color=colorScheme.q1
        // tile.mesh.material.color.set('yellow')
    }
    if(pos.x<0&&pos.y>0&&pos.z>0){
        semiQuarter='q2'
        tile.color=colorScheme.q2
        // tile.mesh.material.color.set('blue')
    }
    if(pos.x<0&&pos.y<0&&pos.z>0){
        semiQuarter='q3'
        tile.color=colorScheme.q3
        // tile.mesh.material.color.set('brown')
    }  
    if(pos.x>0&&pos.y<0&&pos.z>0){
        semiQuarter='q4'
        tile.color=colorScheme.q4
        // tile.mesh.material.color.set('seagreen')
    }

    if(pos.x>0&&pos.y>0&&pos.z<0){
        semiQuarter='q5'
        tile.color=colorScheme.q5
        // tile.mesh.material.color.set('gold')
    }
    if(pos.x<0&&pos.y<0&&pos.z<0){
        semiQuarter='q6'
        tile.color=colorScheme.q6
        // tile.mesh.material.color.set('green')
    }
    if(pos.x>0&&pos.y<0&&pos.z<0){
        semiQuarter='q7'
        tile.color=colorScheme.q7
        // tile.mesh.material.color.set('purple')
    }
    if(pos.x<0&&pos.y>0&&pos.z<0){
        semiQuarter='q8'
        tile.color=colorScheme.q8
        // tile.mesh.material.color.set('pink')
    }
    return semiQuarter;
}


function checkIfPentagon(current,pentagons){
    for(var a=0;a<pentagons.length;a++){
        if(JSON.stringify(current)===JSON.stringify(pentagons[a])){
            return true
        }
    }
    return false
}

function getPentagonCoordinates(positions,options){

    let pentagons=[];
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
            pentagons.push(current)
        }
    }
    return pentagons;
}