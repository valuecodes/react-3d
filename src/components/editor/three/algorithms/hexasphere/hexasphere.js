import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import CubeCells from './../shapes/cubecells'
import VertexNormals from './../../../../../utils/helpers/vertexNormals'
import { useFrame } from 'react-three-fiber';

// 12,4,5

// 1.3
// 2.1
export default function HexaSphere({renderer}) {

    const [hexaSphere, setHexaSphere]=useState(null);
    let savedData=useRef({
        current:0,
        stack:[],
        count:2,
    })

    const [options, setOptions]=useState({
        size:50,
        detail:5,
        wallWidth:5,
        wallColor:0,
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
        setHexaSphere(hexagonSphere)
    },[])

    useFrame(()=>{
        if(hexaSphere.mesh){
            
            let {current,stack,count}=savedData.current
            
            let tiles=hexaSphere.allTiles
            let currentTile=tiles[current]
            currentTile.visited=true
            currentTile.setColor(11)
            let next=currentTile.getNextNeighbor(tiles)
            if(next){

                tiles[next].setColor(12)
                stack.push(currentTile);
                // tiles[next].removeWalls(tiles)
                // currentTile.removeWalls(tiles)
                savedData.current={
                    current:next,
                    stack,
                    count
                }    

            }else if(stack.length > 0){
                let next=stack.pop().id;
                tiles[next].setColor(12)
                savedData.current={
                    current:next,
                    stack,
                    count
                }   
            }else{

            }
            hexaSphere.mesh.geometry.elementsNeedUpdate = true;
            console.log( renderer.info.render);
            // console.log(hexaSphere)
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
