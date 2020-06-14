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

  export function computetaEdges(geometry ){

    let vertices=geometry.vertices
    let edges=[]

    let faces=geometry.faces.map(face =>{
        return [vertices[face.a],vertices[face.b],vertices[face.c],face.a,face.b,face.c]
    })

    function lineCentroid(a,b){
        return new THREE.Vector3( ((a.x+b.x)/2), ((a.y+b.y)/2), ((a.z+b.z)/2) );
    }

    faces.forEach(face => {
        edges.push({
            points:[face[0],face[1]],
            verticeIndex:[face[3],face[4]],
            centroid:lineCentroid(face[0],face[1])
        })
        edges.push({
            points:[face[1],face[2]],
            verticeIndex:[face[4],face[5]],
            centroid:lineCentroid(face[1],face[2])
        })
    });

    edges.push({
        points:[faces[0][2],faces[11][2]],
        centroid:lineCentroid(faces[0][2],faces[11][2])
    })

    return edges;
  }