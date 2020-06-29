import * as THREE from 'three'
import { Vector3, Geometry, OctahedronBufferGeometry } from 'three';

export function disposeElements(mesh, renderer){
    
    // let renderer = new THREE.WebGLRenderer({ antialias: true })
    // mesh.children.forEach(elem=>{
    //     elem.geometry.dispose();
    //     elem.material.dispose();
    //     mesh.remove(elem)
    //     elem=undefined
    // });
    if(renderer){
        mesh.remove.apply(mesh,mesh.children)
        // mesh.geometry.dispose();
        // mesh.material.dispose();
        // mesh=undefined
        renderer.current.renderLists.dispose();
      
    }
}