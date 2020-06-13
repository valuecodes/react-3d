import React from 'react'
import * as THREE from 'three'
import ReactDOM from 'react-dom'
import { Canvas, extend, useThree } from 'react-three-fiber'
import { DragControls } from 'three/examples/jsm/controls/DragControls'

extend({ DragControls })

const ex = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff00ff }))

export default function Box(props) {
    const {
        camera,
        gl: { domElement }
      } = useThree()
    console.log(ex)
      return (
        <>
          <primitive object={ex} />
          <dragControls args={[[ex], camera, domElement]} />
        </>
      )
  }