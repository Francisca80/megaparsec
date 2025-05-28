'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface Sphere3DProps {
  position: [number, number, number]
  scale: number
  color: string
  id: string
  onClick: (id: string) => void
}

export default function Sphere3D({ position, scale, color, id, onClick }: Sphere3DProps) {
  const meshRef = useRef<Mesh>(null)
  const wireframeRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  // Animation variables
  const originalY = position[1]
  const timeOffset = Math.random() * 100

  useFrame((state) => {
    if (meshRef.current && wireframeRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Floating animation
      meshRef.current.position.y = originalY + Math.sin(time + timeOffset) * 0.2
      
      // Rotation
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.008
      
      // Pulsing wireframe
      const pulseScale = 1 + Math.sin(time * 2) * 0.05
      wireframeRef.current.scale.setScalar(pulseScale)
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(scale * 1.05)
      } else if (!clicked) {
        meshRef.current.scale.setScalar(scale)
      }
    }
  })

  const handleClick = () => {
    onClick(id)
    setClicked(true)
    
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale * 1.1)
    }
    
    setTimeout(() => {
      setClicked(false)
      if (meshRef.current) {
        meshRef.current.scale.setScalar(scale)
      }
    }, 200)
  }

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color={color} 
          shininess={100} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      {/* Wireframe detail */}
      <mesh ref={wireframeRef} scale={scale * 0.95}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={0.3} 
          wireframe 
        />
      </mesh>
    </group>
  )
}