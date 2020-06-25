import React,{ useState, useEffect, useRef} from 'react'
import { useFrame } from 'react-three-fiber'
import { Vector3 } from 'three';
export default function Algorithm(props) {
    const {
        gridCells,
        phase,
        cubes,
        listMesh,
        startTracking
    } = props
    const [aStar, setaStar]=useState(false);
    const line=useRef()
    let savedAstar=useRef({
        openSet:[],
        closedSet:[],
        path:[],
        noSolution:false,
        start:[],
        end:[]
    })
    useEffect(()=>{
        if(phase==='pathFinding'){
            startAstar()
        }
    },[phase])

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
        line.current.position.y+=1
        listMesh[0].text='Finding Path...'
        listMesh[0].children[0].material.color.set('green')
        setaStar(true)
    }


    function removeFromArray(arr,elt){
        for(var i=arr.length-1;i>=0;i--){
            if(arr[i]==elt){
                arr.splice(i,1);
            }
        }
    }
    
    function heuristic(a,b){
        return Math.sqrt( Math.pow((a.x-b.x), 2) + Math.pow((a.z-b.z), 2) );
        // return Math.abs(a.i-b.i)+Math.abs(a.j-b.j)
    }

    useFrame(() => {      

        if(aStar){
            console.log('aStar')
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
            // let grid=[...sgrid];


            let notFound=true;
            let ending=false
            listMesh[0].text=`Finding path... Tested ${closedSet.length} / ${cubes.current.length}`

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
                    setaStar(false)
                    ending=true;
                    // listMesh[1].text='Path Found!'
                    // listMesh[1].children[0].material.color.set('black')
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
                    setaStar(false)
                }

                for(var q=0;q<closedSet.length;q++){
                    closedSet[q].material.color.set('khaki')
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
                    path[i].material.color.set('blue')
                }
                addLine(path)     
                if(ending){
                    savedAstar.current.path=path
                    startTracking(savedAstar.current); 
                }
        }
      })
        function addLine(path){
            let coordinates = path.map(cor => new Vector3(cor.x*5, 0, cor.z*5))
            line.current.geometry.setFromPoints(coordinates)
        }

    return (
        <>
            {gridCells.map(elem=>
                <primitive object={elem.mesh}/>
            )}

            <line
                ref={line}
            >
                <bufferGeometry attach="geometry"/>
                <lineBasicMaterial attach="material" color={'red'}/>
            </line>
        </>
    )
}
