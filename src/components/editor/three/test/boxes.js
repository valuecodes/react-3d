import React, {useState,useEffect,useRef} from 'react'
import * as THREE from 'three'
import { removeProperties } from '@babel/types';
import { useFrame,useThree, } from 'react-three-fiber'
import { truncateSync } from 'fs';

export default function Boxes({position}) {

    const [boxes, setBoxes]=useState([]);
    const [loaded, setLoaded]=useState(false)
    const [reverse, setReverse]=useState(false)
    const mesh=useRef();    
    useEffect(()=>{
        let newBoxes=[];
        let array=[];

        let rows=21;
        let cols=21;

        for(var j=0;j<rows;j++){
            for(var i=0;i<cols;i++){
                let geometry=new THREE.BoxGeometry( 4, 4, 4 );
                let material= new THREE.MeshStandardMaterial( {color:'gray'} );
                let newMesh=new THREE.Mesh( geometry, material);
                let target=[(i*5)-50,(j*5)-50]
                console.log(target)
                newMesh.target=target
                // newMesh.position.x=Math.random()*-400
                // newMesh.position.z=Math.random()*40
                // newMesh.position.z=Math.random()*-400
                array.push(newMesh);                 
            }
        }

        for(var i=0;i<200;i++){
       
        }

        mesh.current.add(...array)

        setTimeout(()=>{
            setLoaded(true)
        },1000)

        return ()=> remove();
    },[position])

    function remove(){
        mesh.current.remove.apply(mesh.current,mesh.current.children)
    }

    useFrame(()=>{
        if(loaded&&mesh.current){
                let chil=mesh.current.children
                let flag=true;
                let speed=1

                for(var i=0;i<chil.length;i++){
                    if(chil[i].position.x>chil[i].target[0]){
                        chil[i].position.x-=speed
                        flag=false
                    }
                    if(chil[i].position.x<chil[i].target[0]){
                        chil[i].position.x+=speed
                        flag=false
                    }
                    if(chil[i].position.z>chil[i].target[1]){
                        chil[i].position.z-=speed
                        flag=false
                    }
                    if(chil[i].position.z<chil[i].target[1]){
                        chil[i].position.z+=speed
                        flag=false
                    }
                }
                if(flag){
                    chil.forEach(element => element.target=[0,0]);
                }                
        }
    })

    return (

        <mesh 
            // position={[...box]}
            ref={mesh}
        >

        </mesh>        

    )
}
