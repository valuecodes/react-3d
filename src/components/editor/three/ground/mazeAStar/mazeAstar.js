import React,{ useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from 'react-three-fiber'

import { Vector3, BufferGeometry } from 'three';
import Cell from './cell'


export default function MazeAstar({size}) {
    const [grid, setGrid] = useState([]);
    const [gridCells, setGridCells] = useState([]);
    const [startMaze, setStartMaze]=useState(false);
    const [aStar, setAstar]=useState(false);
    const [track, setTrack]=useState(false);
    const mesh=useRef();
    const line=useRef();
    const cubes=useRef();
    const text=useRef();
    let savedData=useRef({
        current:null,
        stack:[],
    })

    let savedAstar=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    useEffect(()=>{
        let newGridcells=[];
        let rows=size[0];
        let cols=size[1];
        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let gridCell=new Cell(j,i,i*j,rows,cols)
                gridCell.mesh.position.x=(j*5)
                gridCell.mesh.position.z=(i*5)
                gridCell.createWalls()
                newGridcells.push(gridCell)
            }
        }
        newGridcells.forEach(cell => cell.addNeigbors(newGridcells))
        cubes.current=newGridcells;
        savedData.current.current=newGridcells[0];
        setGridCells(newGridcells)
        let geo= new THREE.BufferGeometry()
        let mat =  new THREE.LineBasicMaterial( {color:'red'} );
        let line=new THREE.Line( geo, mat);
        mesh.current.add(line)

        let geoTrack=new THREE.BoxBufferGeometry( 3, 3, 3 );
        let material = new THREE.MeshBasicMaterial( {color: 'steelblue'} );
        let cube = new THREE.Mesh( geoTrack, material );
        cube.scale.y=0.1
        mesh.current.add(cube)

        var loader = new THREE.FontLoader();
        
        loader.load( 'three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
        console.log(font)
            var geometry = new THREE.TextGeometry( 'Hello three.js!', {
                font: font,

                size: 50,
                height: 10,
                curveSegments: 12,
            
                bevelThickness: 1,
                bevelSize: 1,
                bevelEnabled: true
            } );

            var textMaterial = new THREE.MeshPhongMaterial( 
                { color: 0xff0000, specular: 0xffffff }
              );
            let text = new THREE.Mesh( geometry, textMaterial );
            mesh.current.add(text)
            console.log(mesh)
        } );

    },[])

    function removeFromArray(arr,elt){
        for(var i=arr.length-1;i>=0;i--){
            if(arr[i]==elt){
                arr.splice(i,1);
            }
        }
    }
    
    function heuristic(a,b){
        return Math.sqrt( Math.pow((a.i-b.i), 2) + Math.pow((a.j-b.j), 2) );
        // return Math.abs(a.i-b.i)+Math.abs(a.j-b.j)
    }

    function startAstar(){
        savedAstar.current={
            openSet:[cubes.current[0]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:cubes.current[0],
            end:cubes.current[Object.keys(cubes.current).length-1],
            currentPosition:[0,0,0],
            currentTarget:null
        }  
        setAstar(true)
    }

    function startTracking(){
        mesh.current.children[1].position.x=0
        mesh.current.children[1].position.z=0
        mesh.current.children[1].scale.y=1
        savedAstar.current.currentPosition=null
        setTrack(true)
    }

    useFrame(()=>{
        if(startMaze){
            let {current,stack}=savedData.current
            let currentCubes={...cubes.current}
            current.visited=true
            current.current=false;
            current.material.color.set( 'gray' )
            let next = current.getNextNeighbor();
            if (next) {
                next.material.color.set( 'purple' )
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current.setWalls(current);
                next.setWalls(next);
                savedData.current.current=next
                next.current=true;
                cubes.current=currentCubes
              } 
            else if (stack.length > 0) {
                savedData.current.current=stack.pop();              
            }else{
                setStartMaze(false)
                startAstar();
               
            }          
        }
        if(aStar){

            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentPosition,
                currentTarget
            }=savedAstar.current;

            let notFound=true;
            if(openSet.length >0){
                var winner=0;
                for(var i=0;i<openSet.length;i++){
                    if(openSet[i].f<openSet[winner].f){
                        winner=i;
                    }
                }
                var current = openSet[winner];
                current.material.color.set( 'purple' ) 
                if(openSet[winner]===end){
                    console.log('Done!')
                    addLine(mesh,path)
                    setAstar(false)
                    startTracking();
                }

                removeFromArray(openSet,current)
                closedSet.push(current);
                
                let neighbors=current.neighbors;

                let availableNeighbors= neighbors.filter(neighbor => checkWall(neighbor,current))

                for(var i=0;i<availableNeighbors.length;i++){
                    var neighbor=availableNeighbors[i];

                    if(!closedSet.includes(neighbor)){
                        var tempG=current.g+1;

                        let newPath=false;
                        if(openSet.includes(neighbor)){
                            if(tempG<neighbor.g){
                                neighbor.g=tempG
                                newPath=true;
                            }
                        }else{
                            neighbor.g=tempG;
                            newPath=true;
                            openSet.push(neighbor);
                        }
                        if(newPath){
                            neighbor.h=heuristic(neighbor,end)
                            neighbor.f=neighbor.g+neighbor.h;   
                            neighbor.previous=current                    
                        }
                    }
                    neighbor.g=current.g+1;

                }
        
            }else{
                notFound=false
                noSolution=true;
                setAstar(false)
            }
            

            for(var q=0;q<closedSet.length;q++){
                closedSet[q].material.color.set( 'salmon' )             
            }
            
            for(var z=0;z<openSet.length;z++){
                openSet[z].material.color.set('seagreen')
            }
        
            if(!noSolution){
                path=[];
                var temp=current;
                path.push(temp)
                while(temp.previous){     
                    path.push(temp.previous)
                    temp=temp.previous
                }        
            }

            for(var i=0;i<path.length;i++){

                path[i].material.color.set('white')
            }                
            
            addLine(mesh,path)
            savedAstar.current={
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentPosition,
                currentTarget                
            }
        }  
        if(track){

            let {path,currentPosition,currentTarget}=savedAstar.current;
            const tracker=mesh.current.children[1]   
            // tracker.position.x=tracker.position.x+0.5  
                 
            if(currentTarget===null){
                currentTarget=path.length-2;
            }

            let xTarget=path[currentTarget].x*5
            let zTarget=path[currentTarget].z*5
             
            if(xTarget>tracker.position.x){
                tracker.position.x=tracker.position.x+1
            }
            if(xTarget<tracker.position.x){
                tracker.position.x=tracker.position.x-1
            }

            if(zTarget>tracker.position.z){
                tracker.position.z=tracker.position.z+1
            }
            if(zTarget<tracker.position.z){
                tracker.position.z=tracker.position.z-1
            }
            
            if(
                xTarget===tracker.position.x&&
                zTarget===tracker.position.z
            ){
                if(currentTarget===0){
                    setTrack(false)
                }
                currentTarget--;
            } 
            savedAstar.current.currentTarget=currentTarget
        }   
    })
    function addLine(mesh, path){
        let coordinates = path.map(cor => new Vector3(cor.x*5, 1, cor.z*5))
        mesh.current.children[0].geometry.setFromPoints(coordinates)
    }

    return (
        <mesh
        ref={mesh}
        position={[size[0]*-2.5,0,size[1]*-2.5]}
        onClick={e => setStartMaze(!startMaze)}
        >
            {gridCells.map(elem=>
                <primitive object={elem.mesh}/>
            )}
        </mesh>
    )
}

function removeWalls(a, b) {

    let x = a.x - b.x;
    if (x === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (x === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }
    let y = a.z - b.z;
    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  }

 function checkWall(neighbor, current){

    let pos;

    if(neighbor.z===current.z){
        if(neighbor.x>current.x){
            pos=1
        }else{
            pos=3
        }        
    }

    if(neighbor.x===current.x){
        if(neighbor.z<current.z){
            pos=0
        }else{
            pos=2
        }
    }

    return !current.walls[pos];
}