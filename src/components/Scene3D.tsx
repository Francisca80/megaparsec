'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import Sphere3D from './Sphere3D'
import { useMousePosition } from '../hooks/useMousePosition'

interface Scene3DProps {
  onSphereClick: (sphereId: string) => void
}

export default function Scene3D({ onSphereClick }: Scene3DProps) {
  const mousePosition = useMousePosition()

  return (
    <Canvas className="absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} color="#ff6b35" intensity={1} />
      <pointLight position={[-10, -10, 5]} color="#ffa500" intensity={0.8} />
      <pointLight position={[0, 0, -10]} color="#ff3030" intensity={0.6} />

      {/* Stars background */}
<Stars radius={300} depth={60} count={20000} factor={7} />
      
      <Suspense fallback={null}>
        {/* Main spheres */}
        <Sphere3D 
          position={[-3, 2, 0]} 
          scale={1.2} 
          color="#ff6b35"
          id="orange"
          onClick={onSphereClick}
        />
        <Sphere3D 
          position={[0, 0, -2]} 
          scale={2.5} 
          color="#ff3030"
          id="red"
          onClick={onSphereClick}
        />
        <Sphere3D 
          position={[3, -2, 1]} 
          scale={1} 
          color="#ffa500"
          id="yellow"
          onClick={onSphereClick}
        />
        <Sphere3D 
          position={[4, 1, 2]} 
          scale={0.6} 
          color="#ff4040"
          id="small-red"
          onClick={onSphereClick}
        />
      </Suspense>
      
      {/* Camera controls */}
      <CameraController mousePosition={mousePosition} />
    </Canvas>
  )
}

function CameraController({ mousePosition }: { mousePosition: { x: number, y: number } }) {
  // This component will handle smooth camera movement based on mouse position
  // Implementation depends on your specific camera control needs
  return <OrbitControls enableZoom={false} enablePan={false} />
}