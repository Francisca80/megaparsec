'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface DecorativeSphereProps {
  position: [number, number, number]
  scale: number
  color: string
  id: string
}

export default function DecorativeSphere({ position, scale, color, id }: DecorativeSphereProps) {
  const meshRef = useRef<Mesh>(null)
  
  // Animation variables - use deterministic value to avoid hydration mismatch
  const originalY = position[1]
  const timeOffset = id.charCodeAt(0) * 10

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Subtle floating animation
      const floatOffset = Math.sin(time * 0.3 + timeOffset) * 0.03
      meshRef.current.position.y = originalY + floatOffset
      
      // Smooth rotation
      const rotSpeed = 0.0015
      meshRef.current.rotation.x += rotSpeed
      meshRef.current.rotation.y += rotSpeed * 1.5
    }
  })

  return (
    <group position={position}>
      {/* Wireframe-only mesh sphere - transparent and round */}
      <mesh ref={meshRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={0.4} 
          wireframe
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </group>
  )
}

