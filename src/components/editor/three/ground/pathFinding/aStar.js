import React,{useState, useEffect, useRef} from 'react'
import { useFrame } from 'react-three-fiber'
import GridBlock from './gridBlock'
import Spot from './spot'
import Row from './row'


export default function AStar({cameraPosition,orbit}) {

    const [sgrid, setGrid]=useState([[]]);
    const [matrix, setMatrix]=useState({rows:30,cols:30})
    const [AStar, setAStar]=useState(false)
    let savedData=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })


    useEffect(()=>{
        let {rows, cols}=matrix;

        let newGrid=[];
        for(var i=0;i<rows;i++){      
            newGrid[i] = new Array()
        }

        for(var i=0;i<rows;i++){
            for(var a=0;a<cols;a++){
                newGrid[i][a]=new Spot(i,a,-200);
            }
        }

        for(var i=0;i<rows;i++){
            for(var a=0;a<cols;a++){
                newGrid[i][a].addNeighbors(newGrid)
            }
        }
        savedData.current={
            openSet:[newGrid[0][0]],
            closedSet:[],
            path:[],
            noSolution:false,
            start:newGrid[0][0],
            end:newGrid[29][29]
        }     

        setGrid(newGrid)
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

    useFrame(() => {      

        if(AStar){
            let {
                openSet,
                closedSet,
                path,
                noSolution,
                start,
                end
            }=savedData.current;
            let grid=[...sgrid];


            let notFound=true;
                const {rows, cols}=matrix
                if(openSet.length >0){
                    var winner=0;
                    for(var i=0;i<openSet.length;i++){
                        if(openSet[i].f<openSet[winner].f){
                            winner=i;
                        }
                    }
                    var current = openSet[winner];
                    if(openSet[winner]===end){
                        console.log('Done!')
                        setGrid(grid)
                        setAStar(false)
                    }
            
                    removeFromArray(openSet,current)
                    closedSet.push(current);
            
                    let neighbors=current.neighbors;
            
                    for(var i=0;i<neighbors.length;i++){
                        var neighbor=neighbors[i];
                        if(!closedSet.includes(neighbor)&&!neighbor.wall){
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
                    setAStar(false)
                }
            
                for(var i=0;i<cols;i++){
                    for(var j=0;j<rows;j++){
                        grid[i][j].changeColor('yellow');
                        setGrid(grid)
                    }
                }
            
                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].changeColor('red')
                    setGrid(grid)
                }
                
            
                for(var z=0;z<openSet.length;z++){
                    openSet[z].changeColor('green')
                    setGrid(grid)
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
                    path[i].changeColor('blue')
                    setGrid(grid)
                }
                console.log('testS')
            // }   
            // setAStar(false)         
        }


        // if (hovered && !active) {
        //   mesh.current.rotation.z += 0.01
        //   mesh.current.rotation.x += 0.01
        // }
        // if (hovered && active) {
        //   mesh.current.rotation.y += 0.02
        //   mesh.current.rotation.x += 0.06
        // }
      })

      console.log('update')


      console.log('update')
    return (
        <>
            <mesh onClick={e => setAStar(!AStar)}>
                {sgrid.map(row=>
                    <Row row={row}/>
                )}                
            </mesh>

        </>
    )
}
