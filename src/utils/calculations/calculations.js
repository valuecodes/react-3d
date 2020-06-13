import * as THREE from 'three'
import { Vector3, Face3, Face4 } from 'three';

export function computeFaceCentroids( geometry ) {
    var f, fl, face;
    let cor=[];
    for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
  
        face = geometry.faces[ f ];
        face.centroid = new THREE.Vector3( 0, 0, 0 );
  
        if ( face instanceof THREE.Face3 ) {
  
            face.centroid.add( geometry.vertices[ face.a ] );
            face.centroid.add( geometry.vertices[ face.b ] );
            face.centroid.add( geometry.vertices[ face.c ] );
            face.centroid.divideScalar( 3 );
  
        } else if ( face instanceof THREE.Face4 ) {
  
            face.centroid.add( geometry.vertices[ face.a ] );
            face.centroid.add( geometry.vertices[ face.b ] );
            face.centroid.add( geometry.vertices[ face.c ] );
            face.centroid.add( geometry.vertices[ face.d ] );
            face.centroid.divideScalar( 4 );
  
        }
        cor.push(face.centroid)
    }
    return cor
  }

  export function computetaEdgeCentroids(geometry ){
    var f, fl, face;
    let cor=[];
    console.log(geometry)
    // for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
  
    //     face = geometry.faces[ f ];
    //     face.centroid = new THREE.Vector3( 0, 0, 0 );
  
    //     if ( face instanceof THREE.Face3 ) {
  
    //         face.centroid.add( geometry.vertices[ face.a ] );
    //         face.centroid.add( geometry.vertices[ face.b ] );
    //         face.centroid.add( geometry.vertices[ face.c ] );
    //         face.centroid.divideScalar( 3 );
  
    //     } else if ( face instanceof THREE.Face4 ) {
  
    //         face.centroid.add( geometry.vertices[ face.a ] );
    //         face.centroid.add( geometry.vertices[ face.b ] );
    //         face.centroid.add( geometry.vertices[ face.c ] );
    //         face.centroid.add( geometry.vertices[ face.d ] );
    //         face.centroid.divideScalar( 4 );
  
    //     }
    //     cor.push(face.centroid)
    // }
    // return cor
  }