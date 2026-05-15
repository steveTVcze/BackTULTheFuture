import { useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import type { GamePhase } from '../App'
import * as THREE from 'three'
import { Desk } from './Desk'
import { Monitor } from './Monitor'

function FloatingMarker({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  const Y_FLOATING = position[1] + 3.2;

  useFrame((state) => {
    const cam = cameraRef.current
    if (!cam) return
    const time = state.clock.getElapsedTime();
    if (!ref.current) return;
    
    ref.current.position.y = Y_FLOATING + Math.sin(time * 4) * 0.2;
    
    ref.current.rotation.y += 0.05;
  });

  return (
    <group ref={ref} position={[position[0], Y_FLOATING, position[2]]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshBasicMaterial color="#800000" transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[0, 0, 0]} rotation-x={Math.PI}>
        <coneGeometry args={[0.4, 0.6, 16]} />
        <meshBasicMaterial color="#800000" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
let cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;

export function ClassroomScene({ phase, onSitDown, onOpenTerminal }: any) {
  cameraRef = useRef<THREE.PerspectiveCamera | null>(null) 

  const Y_OFFSET = 2.5 
  const xPositions = [-9.5, -3.5, 3.5, 9.5] 
  const zPositions = [-5, 0, 5]
  const playerRowIndex = 2 
  const playerColIndex = 1 

  const initialPos = new THREE.Vector3(13, 11, 18)
  const deskPos = new THREE.Vector3(
    xPositions[playerColIndex], 
    2.2 + Y_OFFSET, 
    zPositions[playerRowIndex] + 5
  )

  const monitorPos = new THREE.Vector3(
    xPositions[playerColIndex], 
    1.8 + Y_OFFSET, 
    zPositions[playerRowIndex] + 2.4
  )

  useFrame(() => {
    const cam = cameraRef.current
    if (!cam) return

    const speed = phase === 'TERMINAL_INTERACTION' ? 0.05 : 0.02

    if (phase === 'APPROACH_DESK') {
      cam.position.lerp(deskPos, speed)
      cam.lookAt(xPositions[playerColIndex], 1.2 + Y_OFFSET, zPositions[playerRowIndex])
    } 
    else if (phase === 'TERMINAL_INTERACTION' || phase === 'GLITCH') {
      cam.position.lerp(monitorPos, speed)
      cam.lookAt(xPositions[playerColIndex], 1.2 + Y_OFFSET, zPositions[playerRowIndex])
    } 
    else if (phase === 'WAKE_UP') {
      cam.position.lerp(initialPos, 0.02)
      cam.lookAt(0, 2 + Y_OFFSET, 0)
    }
  })

  const controlsEnabled = phase === 'WAKE_UP' || phase === 'APPROACH_DESK'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        ref={cameraRef}
        fov={60}
        near={0.5} 
        far={80}
        position={[initialPos.x, initialPos.y, initialPos.z]}
      />
      <OrbitControls enablePan={false} enableZoom={false} enabled={controlsEnabled} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#444444', 0.5]} />
      
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={1.0} 
        castShadow 
        shadow-bias={-0.0005}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <pointLight position={[-5, Y_OFFSET + 8, 0]} intensity={10} distance={30} color="#fffdeb" />
      <pointLight position={[5, Y_OFFSET + 8, 0]} intensity={10} distance={30} color="#fffdeb" />

      {/* Podlaha */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.8} />
      </mesh> 

      <mesh position={[0, 10, -15]}>
        <planeGeometry args={[60, 20]} />
        <meshBasicMaterial color="#d1d1c4" />
      </mesh>

      <mesh position={[-30, 10, 5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[50, 20]} />
        <meshBasicMaterial color="#c8c8ba" />
      </mesh>

      <mesh position={[30, 10, 5]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[50, 20]} />
        <meshBasicMaterial color="#c8c8ba" />
      </mesh>

      <mesh position={[0, 20, 5]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[60, 50]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, 4.5 + Y_OFFSET, -14.9]} receiveShadow>
        <boxGeometry args={[16, 6, 0.2]} />
        <meshStandardMaterial color="#0b2b2b" roughness={0.9} />
      </mesh>

      {zPositions.map((rowZ, rowIndex) =>
        xPositions.map((x, i) => {
          const isPlayerDesk = rowIndex === playerRowIndex && i === playerColIndex
          
          return (
            <group key={`${rowZ}-${x}`}>
              <Desk
                position={[x, Y_OFFSET, rowZ]} 
                isPlayerDesk={isPlayerDesk}
                onClick={isPlayerDesk ? onSitDown : undefined}
              />
              <Monitor 
                position={[x, Y_OFFSET + 2.7, rowZ]}
                onClick={isPlayerDesk && phase === 'CLASSROOM_SITTING' ? onOpenTerminal : undefined}
              />

              {isPlayerDesk && phase !== 'CLASSROOM_SITTING' && phase !== 'TERMINAL_INTERACTION' && phase !== 'GLITCH' && (
                <FloatingMarker position={[x, Y_OFFSET, rowZ]} />
              )}
            </group>
          )
        })
      )}
    </>
  )
}