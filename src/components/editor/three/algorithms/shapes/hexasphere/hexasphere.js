import * as THREE from 'three'
import { Vector3 } from 'three';
import {calcuteDistance} from './../calculations'
import Tile from './tile'

export function createHexasphere(options,group){

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

    let tiles=createTiles(hexaSphere,options)

    addNeighbors(tiles,hexaSphere,options)
    let geom=createHexasphereGeometry(tiles,options,hexaSphere)
    let materials=createMaterials(geom.geom,options,tiles)
    let mesh=new THREE.Mesh(geom.geom, materials)

    hexaSphere.mesh=mesh
    hexaSphere.allTiles=tiles
    hexaSphere.walls=geom.walls
    
    addMeshToTiles(tiles,mesh,geom.walls)
    if(options.obstacles){
        addObstacles(hexaSphere)
    }
    return hexaSphere
}

export function addObstacles(hexaSphere){
    hexaSphere.allTiles.forEach(tile =>{
        tile.obstacle=false
        tile.start=false
        tile.target=false
        tile.setColor(0)
        if(Math.random()<0.3){
            tile.obstacle=true
            tile.setColor(17)   
            tile.setWallColors(1)             
        }
    })
    hexaSphere.mesh.geometry.elementsNeedUpdate = true;
    hexaSphere.walls.geometry.elementsNeedUpdate = true;
}

export function clearObstacles(hexaSphere){
    hexaSphere.allTiles.forEach(tile =>{
        tile.obstacle=false
        tile.start=false
        tile.target=false
        tile.setColor(0)
        tile.setWallColors(0)  
    })
    hexaSphere.mesh.geometry.elementsNeedUpdate = true;
    hexaSphere.walls.geometry.elementsNeedUpdate = true;
}

export function resetHexasphere(hexaSphere,ref,savedData){
    hexaSphere.allTiles.forEach(tile =>{
        tile.obstacle=false
        tile.start=false
        tile.target=false
        tile.f=0;
        tile.g=0;
        tile.h=0;
        tile.current=false;
        tile.previous=false;
        tile.setColor(0)
        tile.setWallColors(0)
    })
    ref.current={
        currentStart:null,
        currentTarget:null,
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:null
    }
    savedData.current={
        current:0,
        stack:[],
        count:2,
    }
    hexaSphere.mesh.geometry.elementsNeedUpdate = true;
    hexaSphere.walls.geometry.elementsNeedUpdate = true;
}

function addMeshToTiles(tiles,merged,walls){
    for(var i=0;i<tiles.length;i++){
        tiles[i].mesh=merged
        tiles[i].wallMesh=walls
    }
}

function createTiles(hexaSphere,options){

    let geometry= new THREE.IcosahedronGeometry(options.size,options.detail);
    let pentagonGeometry= new THREE.IcosahedronGeometry(options.size,1);

    let positions=geometry.vertices
    let pentagonPositions=pentagonGeometry.vertices
    let pentagons=getPentagonCoordinates(pentagonPositions,options)

    let tiles=[];
    let distanceToNext=positions[0].distanceTo(positions[1])

    for(var i=0;i<positions.length;i++){
        
        let pentagon=checkIfPentagon(positions[i],pentagons)
        
        tiles.push(
            new Tile(options,positions[i],i,pentagon,distanceToNext)
        )

        if(tiles[i].quarterName){            
            tiles[i].qID=Object.keys(hexaSphere[tiles[i].quarterName]).length
            hexaSphere[tiles[i].quarterName].push(tiles[i])
            tiles[i].shape='hexagon'
        }

        if(tiles[i].seam){
            tiles[i].materialIndex=options.colorScheme.color?0:9
            hexaSphere.seam.push(tiles[i])
            tiles[i].shape='hexagon'
        }

        if(tiles[i].pentagon){
            tiles[i].materialIndex=options.colorScheme.color?0:10
            hexaSphere.pentagon.push(tiles[i])
            tiles[i].shape='pentagon'
        }

        tiles.id=i

    }  
    return tiles;
}

function createMaterials(geom,options,tiles){

    let colorScheme=options.colorScheme

    let sections=Object.keys(colorScheme);
    geom.materials=[];

    for(var i=0;i<sections.length;i++){
        geom.materials.push(new THREE.MeshPhongMaterial(
        {color : colorScheme[sections[i]],side:2,visible:i===10||colorScheme[sections[i]]===null?false:true }))
        geom.materials[i].name=sections[i]
    }

    return geom.materials
}

function addNeighbors(tiles,hexaSphere,options){
    let seamNeighbors=[];
    let distanceToNext=tiles[0].distanceToNext
    for(var q=1;q<=8;q++){
        let quarterName=hexaSphere[`q${q}`]
        let sNeighbors=addQuarterNeighbors(quarterName,tiles,options,distanceToNext,hexaSphere)
        seamNeighbors=[...seamNeighbors,...sNeighbors]
        console.log(q+' Ready')
    }

    let seam=hexaSphere.seam

    for(var i=0;i<seam.length;i++){
        searchNeighborsFrom(seam[i],tiles,distanceToNext,options)
    }

}

function getPathFromNeighbors(current){

    let path=[];

    for(var i=0;i<current.neighbors.length;i++){
        let target=current.neighbors[i].center
        current.neighbors[i].hexagon=false
        path.push(target)         
        
    }

    let len=path.length
    for(var a=0;a<3;a++){
        let correct=true;
        for(var i=0;i<len;i++){
            let dist1=path[i].distanceTo(path[(i+1)%len])
            let dist2=path[i].distanceTo(path[(i+2)%len])
            if(dist2<dist1){
                correct=false
                path=modifyPath(path,(i+1)%len,(i+2)%len)
            }
        }
        if(a===2&&!correct){
            path=modifyPath(path,1,3)
        }
    }

    len=path.length
    let pathCopy=path[0]
    for(var i=0;i<path.length;i++){
        let index=i;
        let dist=current.center
        let dist1=path[index]
        let dist2;
        if(index+1===len){   
            dist2=pathCopy
        }else{
            dist2=path[index+1]
        }
        path[i]=getCentroid(dist,dist1,dist2)
    }
    return path
}


function createPentagon(current,options){
    let path=getPathFromNeighbors(current);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(...path)

    geometry.faces.push(
        new THREE.Face3(0,1,3),
        new THREE.Face3(1,2,3),
        new THREE.Face3(3,4,0),
    )
    
    geometry.computeFaceNormals()
    geometry.computeVertexNormals()
    let mesh = new THREE.Mesh( geometry)
    mesh.type='pentagon'
    mesh.materialIndex=current.materialIndex
    mesh.distanceToNext=current.distanceToNext
    mesh.center=current.center
    mesh.diameter=current.center.distanceTo(path[0])
    let vertices=createVertices(path,current);
    current.walls=[true,true,true,true,true]
    return {mesh,vertices}
}

function createHexagon(current){
    current.hexagon=true
    let path=getPathFromNeighbors(current);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(...path)

    geometry.faces.push(
        new THREE.Face3(0,1,3),
        new THREE.Face3(5,0,3),            
        new THREE.Face3(1,2,3),
        new THREE.Face3(3,4,5),
    )        

    geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    let mesh = new THREE.Mesh( geometry) 

    let vertices=createVertices(path,current);

    mesh.type='hexagon'
    mesh.center=current.center
    mesh.diameter=current.center.distanceTo(path[0])
    mesh.materialIndex=current.materialIndex

    current.walls=[true,true,true,true,true,true]

    return {mesh,vertices}
}

function createHexasphereGeometry(tiles,options){

    let meshes=[];
    let vertices=[];

    for(var i=0;i<tiles.length;i++){
        if(tiles[i].shape==='hexagon'){
            let hexagon=createHexagon(tiles[i])
            meshes.push(hexagon.mesh);        
            vertices.push(hexagon.vertices);      
        }else{
            let pentagon= createPentagon(tiles[i],options)
            meshes.push(pentagon.mesh);
            vertices.push(pentagon.vertices) 
        }   
    }
    
    let walls=createWalls(tiles,vertices,meshes,options)

    let wireFrame=vertices.flat()

    var geom=new THREE.Geometry();
    let wallIndex=0;

    for(var i=0;i<meshes.length;i++){
        geom.mergeMesh(meshes[i]);

        if(meshes[i].type==='hexagon'){
            geom.faces[geom.faces.length-1].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-2].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-3].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-4].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-1].parent=tiles[i]
            geom.faces[geom.faces.length-2].parent=tiles[i]
            geom.faces[geom.faces.length-3].parent=tiles[i]
            geom.faces[geom.faces.length-4].parent=tiles[i]
            tiles[i].faces=[
                geom.faces.length-1,
                geom.faces.length-2,
                geom.faces.length-3,
                geom.faces.length-4,
            ]
            tiles[i].vertices=[
                wallIndex,
                wallIndex+1,
                wallIndex+2,
                wallIndex+3,
                wallIndex+4,
                wallIndex+5
            ]
            wallIndex+=5
        }

        if(meshes[i].type==='pentagon'){
            geom.faces[geom.faces.length-1].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-2].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-3].materialIndex=meshes[i].materialIndex
            geom.faces[geom.faces.length-1].parent=tiles[i]
            geom.faces[geom.faces.length-2].parent=tiles[i]
            geom.faces[geom.faces.length-3].parent=tiles[i]
            tiles[i].faces=[
                geom.faces.length-1,
                geom.faces.length-2,
                geom.faces.length-3,
            ]
            tiles[i].vertices=[
                wallIndex,
                wallIndex+1,
                wallIndex+2,
                wallIndex+3,
                wallIndex+4,
            ]
            wallIndex+=4
        }
    }

    geom.computeBoundingSphere();
    geom.computeFaceNormals();
    geom.computeVertexNormals();

    return {geom,wireFrame,walls}
}

function calculateCenter(start,end,options){
    let copy=start
    for(var i=0;i<options.wallWidth;i++){
        copy=new Vector3(
            (copy.x+end.x)/2,
            (copy.y+end.y)/2,
            (copy.z+end.z)/2
        )
    }
    return copy
}

function createWalls(tiles,vertices,meshes,options){

    var geom=new THREE.Geometry();

    var hexaGeometry = new THREE.RingGeometry( 4, 5, 6 );
    let hexafaces=hexaGeometry.faces.map(face => new THREE.Face3(face.a,face.b,face.c))

    var pentaGeometry = new THREE.RingGeometry( 4, 5, 5 );
    let pentafaces=pentaGeometry.faces.map(face => new THREE.Face3(face.a,face.b,face.c))

    let wallCount=0;

    for(var i=0;i<meshes.length;i++){
        let mesh;
        if(meshes[i].type==='hexagon'){
            mesh = createHexagonWalls(meshes[i],vertices[i],hexafaces,options)
            tiles[i].wallFaces=[
                [wallCount    ,wallCount + 1 ],
                [wallCount + 2,wallCount + 3 ],
                [wallCount + 4,wallCount + 5 ],
                [wallCount + 6,wallCount + 7 ],
                [wallCount + 8,wallCount + 9 ],
                [wallCount + 10,wallCount + 11],
            ]      
            wallCount+=12
        }
        if(meshes[i].type==='pentagon'){
            mesh = createPentagonWalls(meshes[i],vertices[i],pentafaces,options) 

            tiles[i].wallFaces=[
                [wallCount    ,wallCount + 1],
                [wallCount + 2,wallCount + 3],
                [wallCount + 4,wallCount + 5],
                [wallCount + 6,wallCount + 7],
                [wallCount + 8,wallCount + 9],
            ] 
            wallCount+=10
        }
        geom.mergeMesh(mesh);  
        addWallPositionsToFaces(geom,vertices[i],options)
    }

    var material = new THREE.MeshStandardMaterial( { color: options.wallColors.unvisited, side: THREE.DoubleSide, visible:options.wallWidth===false?false:true} );
    
    var material1 = new THREE.MeshStandardMaterial( { color: options.wallColors.visited, side: THREE.DoubleSide, visible:options.wallWidth===false?false:true} );

    var material2 = new THREE.MeshStandardMaterial( { color: '', side: THREE.DoubleSide,visible:false} );
    let combinedMesh = new THREE.Mesh( geom, [material,material1,material2] );  

    return combinedMesh
}

function addWallPositionsToFaces(geom,vertices){

    if(vertices.length===6){
        geom.faces[geom.faces.length-1].position=lineCenterPoint(vertices[5][0],vertices[5][1])
        geom.faces[geom.faces.length-2].position=lineCenterPoint(vertices[5][0],vertices[5][1])
        geom.faces[geom.faces.length-3].position=lineCenterPoint(vertices[4][0],vertices[4][1])
        geom.faces[geom.faces.length-4].position=lineCenterPoint(vertices[4][0],vertices[4][1])
        geom.faces[geom.faces.length-5].position=lineCenterPoint(vertices[3][0],vertices[3][1])
        geom.faces[geom.faces.length-6].position=lineCenterPoint(vertices[3][0],vertices[3][1])
        geom.faces[geom.faces.length-7].position=lineCenterPoint(vertices[2][0],vertices[2][1])
        geom.faces[geom.faces.length-8].position=lineCenterPoint(vertices[2][0],vertices[2][1])
        geom.faces[geom.faces.length-9].position=lineCenterPoint(vertices[1][0],vertices[1][1])
        geom.faces[geom.faces.length-10].position=lineCenterPoint(vertices[1][0],vertices[1][1])
        geom.faces[geom.faces.length-11].position=lineCenterPoint(vertices[0][0],vertices[0][1])    
        geom.faces[geom.faces.length-12].position=lineCenterPoint(vertices[0][0],vertices[0][1])              
    }

    if(vertices.length===5){
        geom.faces[geom.faces.length-1].position=lineCenterPoint(vertices[4][0],vertices[4][1])
        geom.faces[geom.faces.length-2].position=lineCenterPoint(vertices[4][0],vertices[4][1])
        geom.faces[geom.faces.length-3].position=lineCenterPoint(vertices[3][0],vertices[3][1])
        geom.faces[geom.faces.length-4].position=lineCenterPoint(vertices[3][0],vertices[3][1])
        geom.faces[geom.faces.length-5].position=lineCenterPoint(vertices[2][0],vertices[2][1])
        geom.faces[geom.faces.length-6].position=lineCenterPoint(vertices[2][0],vertices[2][1])
        geom.faces[geom.faces.length-7].position=lineCenterPoint(vertices[1][0],vertices[1][1])
        geom.faces[geom.faces.length-8].position=lineCenterPoint(vertices[1][0],vertices[1][1])
        geom.faces[geom.faces.length-9].position=lineCenterPoint(vertices[0][0],vertices[0][1])    
        geom.faces[geom.faces.length-10].position=lineCenterPoint(vertices[0][0],vertices[0][1])                  
    }


}

function lineCenterPoint(start,end){
    return new Vector3(
        (start.x+end.x)/2,
        (start.y+end.y)/2,
        (start.z+end.z)/2
    )
}

function createPentagonWalls(mesh,wall,faces,options){
    let vertices=[
        calculateCenter(mesh.center,wall[0][0],options),
        calculateCenter(mesh.center,wall[1][0],options),
        calculateCenter(mesh.center,wall[2][0],options),
        calculateCenter(mesh.center,wall[3][0],options),
        calculateCenter(mesh.center,wall[4][0],options),
        wall[0][0],
        wall[1][0],
        wall[2][0],
        wall[3][0],
        wall[4][0],
    ]
    var geome = new THREE.Geometry();  
    
    geome.faces=faces
    geome.vertices=vertices
    geome.computeBoundingSphere();
    geome.computeFaceNormals();
    geome.computeVertexNormals();
    var newMesh = new THREE.Mesh( geome); 
    newMesh.scale.x=1.0005
    newMesh.scale.y=1.0005
    newMesh.scale.z=1.0005
    return newMesh
}

function createHexagonWalls(mesh,wall,faces,options){
    let vertices=[
        calculateCenter(mesh.center,wall[0][0],options),
        calculateCenter(mesh.center,wall[1][0],options),
        calculateCenter(mesh.center,wall[2][0],options),
        calculateCenter(mesh.center,wall[3][0],options),
        calculateCenter(mesh.center,wall[4][0],options),
        calculateCenter(mesh.center,wall[5][0],options),
        wall[0][0],
        wall[1][0],
        wall[2][0],
        wall[3][0],
        wall[4][0],
        wall[5][0],
    ]
    var geome = new THREE.Geometry();  
    geome.faces=faces
    geome.vertices=vertices
    geome.computeBoundingSphere();
    geome.computeFaceNormals();
    geome.computeVertexNormals();
    let newMesh = new THREE.Mesh( geome); 
    newMesh.scale.x=1.0005
    newMesh.scale.y=1.0005
    newMesh.scale.z=1.0005
    return newMesh
}

function searchNeighborsFrom(current,section,dist,options){

    let newNeighbors=current.neighbors;
    let curCenter=current.center

    let offSet=options.detail>5?1.3:1.4
    
    for(var i=0;i<section.length;i++){
        if(section[i]){
            let target=section[i].center
            let distance=curCenter.distanceTo(target)
            if(distance<0.1){
                continue
            }
            if(distance<dist*offSet){
                newNeighbors.push(section[i])
                if(newNeighbors.length===6){
                    break
                }
            }             
        }
    }

    return newNeighbors
}

function addQuarterNeighbors(quarterName,tiles,options,distanceToNext,hexaSphere){
      
    let seamNeighbors=[];

    for(var i=0;i<quarterName.length;i++){
        let current=quarterName[i];
        let currentNeighbors=searchNeighborsFrom(current,quarterName,distanceToNext,options)
        if(currentNeighbors.length===6){
            current.neighbors=currentNeighbors
        }else{
            seamNeighbors.push(current)
            let seam=hexaSphere.seam
            let currentNeighbors=searchNeighborsFrom(current,seam,distanceToNext,options)
            current.neighbors=currentNeighbors
        }
    }
    return seamNeighbors
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
        let neighbors=[];
        for(var a=0;a<positions.length;a++){
            if(i===a) continue
            let target=positions[a]
            let distance=calcuteDistance(current,target)
            if(distance<options.size+1){
                neighbors.push(target)
            }
        }
        if(neighbors.length===5){
            pentagons.push(current)
        }
    }
    return pentagons;
}

function createVertices(path,current){
    let vertices=[];
    for(var i=0;i<path.length;i++){
        vertices.push([path[i],path[(i+1)%path.length]])
    }
    return vertices
}

function modifyPath(path,a,b){
    let copy=path[a]
    path[a]=path[b]
    path[b]=copy
    return path
}

function getCentroid(a,b,c){
    return new THREE.Vector3( ((a.x+b.x+c.x)/3), ((a.y+b.y+c.y)/3), ((a.z+b.z+c.z)/3) ); 
}
