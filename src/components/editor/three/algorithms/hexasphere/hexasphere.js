import React,{useRef,useState,useEffect} from 'react'
import { createHexasphere } from './../shapes/hexasphere/hexasphere'
import CubeCells from './../shapes/cubecells'
import VertexNormals from './../../../../../utils/helpers/vertexNormals'
import { useFrame } from 'react-three-fiber';

// 12,4,5

// 1.3
// 2.1
export default function HexaSphere() {

    const [hexaSphere, setHexaSphere]=useState(null);

    const [options, setOptions]=useState({
        size:20,
        detail:4,
        // colorScheme:{
        //     q1:'#262729',
        //     q2:'#262729',
        //     q3:'#262729',
        //     q4:'#262729',
        //     q5:'#262729',
        //     q6:'#262729',
        //     q7:'#262729',
        //     q8:'#262729',
        //     seam:'#262729',
        //     pentagon:'#262729'
        // },
        colorScheme:{
            q1:'yellow',
            q2:'blue',
            q3:'brown',
            q4:'seagreen',
            q5:'gold',
            q6:'green',
            q7:'purple',
            q8:'pink',
            seam:'#262729',
            pentagon:'black',
            notVisible:null
        }
    })

    useEffect(()=>{
        let hexagonSphere = createHexasphere(options,group)
        group.current.add(hexagonSphere.mesh)
        setHexaSphere(hexagonSphere)
    },[])

    useFrame(()=>{
        if(hexaSphere.mesh){


            // let randomFace=Math.floor(Math.random()*group.current.children[0].geometry.faces.length)
            // // let rand=Math.floor(Math.random()*4)
            // // console.log(randomFace,group.current.children[0].geometry.faces)
            // group.current.children[0].geometry.faces[randomFace].materialIndex=10;
            // group.current.children[0].geometry.colorsNeedUpdate = true;
            // group.current.children[0].geometry.elementsNeedUpdate = true;

            // for(var i = 0 ; i < faces.length; i++){
                // faces[ i ].materialIndex=0
            // }
            //   console.log(group.current.children[0].material[0].color.r=0.9)

            //   group.current.children[0].geometry.verticesNeedUpdate = true;
            //   
            //   group.current.children[0].geometry.morphTargetsNeedUpdate = true;
            //   group.current.children[0].geometry.uvsNeedUpdate = true;
            //   group.current.children[0].geometry.normalsNeedUpdate = true;
              
            //   group.current.children[0].geometry.tangentsNeedUpdate = true;
            // hexaSphere.mesh.geometry.colorsNeedUpdate = true;
            // hexaSphere.mesh.geometry.elementsNeedUpdate = true;
            // let faces=hexaSphere.mesh.geometry.faces

            // for(var i = 0 ; i < faces.length; i++){
            //     var face = faces[i];
            //     var color = new THREE.Color("rgb(255, 0, 0)");
            //     face.color = color;
            // }

            // // hexagonSphere.mesh.children[0].face.color.set('black')
            // hexaSphere.mesh.geometry.faces[0].color[1]=100
            // hexaSphere.mesh.geometry.faces[1].color[1]=100
            // hexaSphere.mesh.geometry.faces[2].color[1]=100
            // hexaSphere.mesh.geometry.faces[3].color[1]=100
            // // hexaSphere.mesh.geometry.faces[0].color[1]=100
            // // hexaSphere.mesh.geometry.faces[1].color.setRGB( 1, 200, 0 )
            // // hexaSphere.mesh.geometry.faces[2].color.setRGB( 1, 200, 0 )
            // // hexaSphere.mesh.geometry.faces[3].color.setRGB( 1, 200, 0 )
            // // hexaSphere.mesh.geometry.faces[4].color.setRGB( 1, 200, 
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
