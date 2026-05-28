import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

export function PazourekModel(props: any) {
  const { scene } = useGLTF('./models/pazourek.glb')
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5; 
    }
  })

  return (
    <group ref={groupRef} {...props}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('./models/pazourek.glb')