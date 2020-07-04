
import React,{useEffect} from 'react'

import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import * as THREE from 'three'
// require( 'three-instanced-mesh' )(THREE);
import { Vector3, BoxBufferGeometry, MeshPhongMaterial, Quaternion } from 'three' 
// var InstancedMesh = require('three-instanced-mesh')( THREE );
// import { InstancedMesh } from 'three-instanced-mesh'(THREE)
// require( 'three-instanced-mesh' )(THREE);

export default function Instancing({main}) {

    useEffect(()=>{

            // var boxGeometry = new THREE.BoxBufferGeometry(20,20,20);

            // //material that the geometry will use
            // var material = new THREE.MeshPhongMaterial({color:'red'});

            // let count=10000

            // //the instance group
            // var cluster = new THREE.InstancedMesh( 
            // boxGeometry,                 //this is the same 
            // material, 
            // count,                                           
            // );

            // var dummy = new THREE.Object3D();
            
            // var _v3 = new THREE.Vector3();

            // for ( var i = 0 ; i < count ; i ++ ) {

            //     dummy.position.set( i*1, i*1, i*1);
            //     dummy.updateMatrix();
            //     cluster.setMatrixAt( i ++, dummy.matrix );
            // }           
   
            // main.current.add(cluster);
            
            //geometry to be instanced
            // var boxGeometry = new BoxBufferGeometry(20,20,20,1,1,1);

            // //material that the geometry will use
            // var material = new MeshPhongMaterial();

            // //the instance group
            // var cluster = new InstancedMesh( 
            // boxGeometry,                 //this is the same 
            // material, 
            // 10000,                       //instance count
            // false,                       //is it dynamic
            // true,                        //does it have color
            // true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
            // );

            // // var _v3 = new Vector3();
            // // var _q = new Quaternion();
            // console.log(cluster)
            // for ( var i = 0 ; i < 10000 ; i ++ ) {
            
            //     // cluster.setQuaternionAt( i , _q );
            //     // cluster.setPositionAt( i , _v3.set( Math.random() , Math.random(), Math.random() ) );
            //     // cluster.setScaleAt( i , _v3.set(1,1,1) );

            // }

            // // scene.add( cluster );
            // main.current.add(cluster);
    },[main])
        


    return (
        <></>
    )
}
