import { useGLTF, Center } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

type DeskProps = {
  position: [number, number, number]
  onClick?: () => void
  isPlayerDesk?: boolean
}

export function Desk({ position, onClick, isPlayerDesk }: DeskProps) {
  const { scene } = useGLTF('./models/lavice.glb')
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        
        mat.roughness = 0.6
        mat.metalness = 0.1

        if (isPlayerDesk) {
          mat.color.set('#ffb347')
          mat.emissive = new THREE.Color('#ffb347')
          mat.emissiveIntensity = 0.2
        } else {
          mat.color.set('#808080')
          mat.emissive = new THREE.Color('#000000')
        }
      }
    })
    return clone
  }, [scene, isPlayerDesk])

  return (
    <group position={position} onClick={onClick}>
      <Center bottom>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

useGLTF.preload('./models/lavice.glb')