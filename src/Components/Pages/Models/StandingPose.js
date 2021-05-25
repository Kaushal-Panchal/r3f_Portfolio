/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from '@react-three/drei';
import React, { useRef } from 'react'


export default function StandingPose(props) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/StandingPose.glb')
  console.log(nodes);
  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={[0.23, 0.23, 0.23]}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Belt_Mesh003_Ch23_body.geometry}
          skeleton={nodes.Ch23_Belt_Mesh003_Ch23_body.skeleton}
        />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Body_Mesh001_Skin.geometry}
          skeleton={nodes.Ch23_Body_Mesh001_Skin.skeleton}
        />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Pants_Mesh005_Ch23_body.geometry}
          skeleton={nodes.Ch23_Pants_Mesh005_Ch23_body.skeleton}
        />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Shirt_Mesh004_Ch23_body.geometry}
          skeleton={nodes.Ch23_Shirt_Mesh004_Ch23_body.skeleton}
        />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Shoes_Mesh_Ch23_body.geometry}
          skeleton={nodes.Ch23_Shoes_Mesh_Ch23_body.skeleton}
        />
        <skinnedMesh
          material={materials.Ch23_body}
          geometry={nodes.Ch23_Suit_Mesh002_Ch23_body.geometry}
          skeleton={nodes.Ch23_Suit_Mesh002_Ch23_body.skeleton}
        />
        <skinnedMesh
          material={materials.Beard}
          geometry={nodes.Head_NurbsPath010_Beard.geometry}
          skeleton={nodes.Head_NurbsPath010_Beard.skeleton}
        />
        <skinnedMesh
          material={materials.Hair}
          geometry={nodes.Head_NurbsPath010_Hair.geometry}
          skeleton={nodes.Head_NurbsPath010_Hair.skeleton}
        />
        <skinnedMesh
          material={materials.HairBase}
          geometry={nodes.Head_NurbsPath010_HairBase.geometry}
          skeleton={nodes.Head_NurbsPath010_HairBase.skeleton}
        />
        <skinnedMesh
          material={materials.Skin}
          geometry={nodes.Head_NurbsPath010_Skin.geometry}
          skeleton={nodes.Head_NurbsPath010_Skin.skeleton}
        />
      </group>
      <group position={[0.13, 7.2, 0.75]} rotation={[-0.01, 0.28, 0.08]} scale={[0.29, 0.41, 0.32]}>
        <mesh material={materials.Base} geometry={nodes.Cube002.geometry} />
        <mesh material={materials.Shadow} geometry={nodes.Cube002_1.geometry} />
      </group>
    </group>
  )
}

useGLTF.preload('/StandingPose.glb')