import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import CubeCells from './../shapes/cubecells'
import VertexNormals from './../../../../../utils/helpers/vertexNormals'
import { useFrame } from 'react-three-fiber';
import * as THREE from 'three'
export default function HexaSphere() {

    const [hexaSphere, setHexaSphere]=useState(null);
    let savedData=useRef({
        current:0,
        stack:[],
        count:2,
    })

    const [maze, setMaze]=useState(false)
    const [astar, setAstar]=useState(false)

    const [options, setOptions]=useState({
        size:50,
        detail:2,
        wallWidth:4,
        wallColors:{
            unvisited:'black',
            visited:'red',
            notVisible:'',
        },
        colorScheme:{
            q1:'#262729',
            q2:'#262729',
            q3:'#262729',
            q4:'#262729',
            q5:'#262729',
            q6:'#262729',
            q7:'#262729',
            q8:'#262729',
            seam:'#262729',
            pentagon:'#262729',
            notVisible:'',
            selected:'red',
            current:'purple',
            openSet:'green',
            closedSet:'orange',
            path:'blue'
        },
        // colorScheme:{
        //     q1:'red',
        //     q2:'blue',
        //     q3:'brown',
        //     q4:'seagreen',
        //     q5:'gold',
        //     q6:'green',
        //     q7:'purple',
        //     q8:'pink',
        //     seam:'#262729',
        //     pentagon:'black',
        //     notVisible:'',
        //     selected:'yellow',
        //     current:'purple',
        // }
    })

    useEffect(()=>{
        let hexagonSphere = createHexasphere(options,group)
        group.current.add(hexagonSphere.mesh)
        group.current.add(hexagonSphere.walls)

        // let tiles=hexagonSphere.allTiles
        // let currentTile=tiles[0]
        // let next=1

        // removeWalls(0, next, hexagonSphere);
        console.log(hexagonSphere)
        setHexaSphere(hexagonSphere)
        setMaze(true)
    },[])

    let aStarRef=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })

    useFrame(()=>{
 
        if(maze){
            
            let {current,stack,count}=savedData.current
            let tiles=hexaSphere.allTiles
            let currentTile=tiles[current]
            currentTile.visited=true
            currentTile.setColor(11)
            let next=currentTile.getNextNeighbor(tiles)
            if(next){

                tiles[next].setColor(12)
                stack.push(currentTile);
                removeWallsBetween(current, next, hexaSphere);

                savedData.current={
                    current:next,
                    stack,
                    count
                }    
                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
                hexaSphere.walls.geometry.elementsNeedUpdate = true;                

            }else if(stack.length > 0){

                let next=stack.pop().id;
                savedData.current={
                    current:next,
                    stack,
                    count
                }   
            }else{
                hexaSphere.walls.geometry.elementsNeedUpdate = true;   
                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
                setMaze(false)
                aStarRef.current={
                    openSet:[tiles[5]],
                    closedSet:[],
                    path:[],
                    noSolution:false,
                    start:tiles[5],
                    end:tiles[60],
                    currentTarget:null
                }  
                setAstar(true)
            }
        }

        if(astar){
            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end,
                currentTarget
            }=aStarRef.current;

            let tiles=hexaSphere.allTiles

            if(openSet.length >0){

                var winner=0;

                for(var i=0;i<openSet.length;i++){
                    if(openSet[i].f<openSet[winner].f){
                        winner=i;
                    }
                }

                var currentTile = openSet[winner];

                currentTile.setColor(12)
                console.log(currentTile)
                if(openSet[winner]===end){
                    for(var i=0;i<path.length;i++){
                        path[i].setColor(15)
                    }   

                    console.log('Done!')
                    // aStarRef.current.path=calculatePath(currentTile);
                }

                // for(var i=0;i<tiles.length;i++){
                //     tiles[i].setColor(1)
                // }
        

                removeFromArray(openSet,currentTile)
                closedSet.push(currentTile);
        
                let neighbors=currentTile.neighbors;
                console.log(openSet)
                for(var i=0;i<neighbors.length;i++){
                    var neighbor=neighbors[i];
                    
                    if(!neighbor){
                        console.log('neigbor not found!')
                        continue
                    }

                    let wallBetween=calculateWallBetween(currentTile,neighbor,hexaSphere)   
                    // let wallBetween=currentTile.walls[i];   
                    console.log(wallBetween)
                    if(!closedSet.includes(neighbor)&&!wallBetween){
                        var tempG=currentTile.g+1;
                        let newPath=false;

                        if(openSet.includes(neighbor)){
                            if(tempG<neighbor.g){
                                neighbor.g=tempG
                                newPath=true;
                            }
                        }else{
                            neighbor.g=tempG;
                            newPath=true;
                            console.log('pushhing')
                            openSet.push(neighbor);
                        }

                        if(newPath){
                            neighbor.h=heuristic(neighbor,end)
                            neighbor.f=neighbor.g+neighbor.h;  
                            neighbor.previous=currentTile                   
                        }

                    }
                    neighbor.g=currentTile.g+1;

                }
                // aStarRef.current.openSet=openSet
                // aStarRef.current.closedSet=closedSet
   
                }else{

                    // if(!noSolution){
                    //     path=calculatePath(currentTile);
                    // }
    
                    // for(var i=0;i<path.length;i++){
                    //     path[i].setColor(15)
                    // }  
                    // notFound=false
                    for(var i=0;i<path.length;i++){
                        path[i].setColor(15)
                    }   
                    noSolution=true;
                    console.log('No solution')
                    setAstar(false)
                }

                hexaSphere.mesh.geometry.elementsNeedUpdate = true;
                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].setColor(14)
                }

                for(var z=0;z<openSet.length;z++){
                    openSet[z].setColor(13)
                }
        

                if(!noSolution){
                    path=calculatePath(currentTile);
                }

                for(var i=0;i<path.length;i++){
                    path[i].setColor(15)
                }   
                aStarRef.current.path=path

        }

    })




    const group=useRef();

    return (
        <group
            position={[0,-20,0]}
            ref={group}
        >
            {/* <CubeCells cubeCells={tiles} /> */}

        </group>
    )
}

export function calculatePath(currentCell){
    let path=[];
    var temp=currentCell;
    path.push(temp)
    if(temp){
        while(temp.previous){
            path.push(temp.previous)
            temp=temp.previous
        }                           
    }
    return path
}

export function calcuteDistance(current, target){
    let distance=
    Math.abs(current.x-target.x)+
    Math.abs(current.y-target.y)+
    Math.abs(current.z-target.z) 
    return distance
}

export function heuristic(a,b){
    // console.log(a,b)
    return calcuteDistance(a.center,b.center)
}

function calculateWallBetween(a, b,hexaSphere) {
    let first=a
    let second=b

    let aFaces=first.wallFaces
    let bFaces=second.wallFaces
    let faces=hexaSphere.walls.geometry.faces;
    let distanceToNext=first.distanceToNext

    let aClosest;
    let bClosest;

    console.log(aFaces,a.walls,a.neighbors)

    for(var i=0;i<aFaces.length;i++){
        let distance=faces[aFaces[i][0]].position.distanceTo(second.center)
        if(distance<distanceToNext*0.7){
            
            aClosest=i
        }
    }
    console.log(a.walls[aClosest])
    return a.walls[aClosest]

  }


function removeWallsBetween(a, b,hexaSphere) {
    let first=hexaSphere.allTiles[a]
    let second=hexaSphere.allTiles[b]

    let aFaces=first.wallFaces
    let bFaces=second.wallFaces
    let faces=hexaSphere.walls.geometry.faces;
    let distanceToNext=first.distanceToNext

    let aClosest;
    let bClosest;

    for(var i=0;i<aFaces.length;i++){
        let distance=faces[aFaces[i][0]].position.distanceTo(second.center)
        if(distance<distanceToNext*0.7){
            
            aClosest=i
        }
    }

    for(var i=0;i<bFaces.length;i++){
        let distance=faces[bFaces[i][0]].position.distanceTo(first.center)
        if(distance<distanceToNext*0.7){
            bClosest=i
        }
    }

    first.removeWall(aClosest)
    second.removeWall(bClosest)

  }

  export function removeFromArray(arr,elt){
    //   console.log(arr)
    for(var i=arr.length-1;i>=0;i--){
        // console.log(arr[i],elt)
        if(arr[i].id==elt.id){
            arr.splice(i,1);
        }
    }
    // console.log(arr)
}