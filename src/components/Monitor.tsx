import { useGLTF, Center, Clone } from '@react-three/drei'
import { Suspense } from 'react'

function MonitorModel({ onClick }: { onClick?: () => void }) {
  const { scene } = useGLTF('./models/monitor.glb')

  return (
    <Center bottom>
      <Clone 
        object={scene} 
        scale={3.5} 
        onClick={onClick}
      />
    </Center>
  )
}

export function Monitor(props: any) {
  return (
    <group position={props.position}>
      <Suspense fallback={
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      }>
        <MonitorModel onClick={props.onClick} />
      </Suspense>
    </group>
  )
}

useGLTF.preload('./models/monitor.glb')