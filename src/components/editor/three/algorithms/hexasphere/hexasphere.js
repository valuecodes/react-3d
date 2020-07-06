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

    const [options, setOptions]=useState({
        size:50,
        detail:4,
        wallWidth:4,
        wallColors:{
            unvisited:'red',
            visited:'black',
            notVisible:'',
        },
        colorScheme:{
            q1:'#262729',
            q2:'#262729',
            q3:'#262729',
            q4:'seagreen',
            q5:'#262729',
            q6:'#262729',
            q7:'#262729',
            q8:'#262729',
            seam:'#262729',
            pentagon:'#262729',
            notVisible:'',
            selected:'yellow',
            current:'purple',
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
        //     notVisible:null
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

        setHexaSphere(hexagonSphere)
        setMaze(true)
    },[])

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
            }

            

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