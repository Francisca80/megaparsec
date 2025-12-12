'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import * as THREE from 'three'

interface Sphere3DProps {
  position: [number, number, number]
  scale: number
  color: string
  id: string
  onClick: (id: string) => void
  onPositionUpdate?: (id: string, screenPos: { x: number; y: number; visible: boolean }) => void
}

export default function Sphere3D({ position, scale, color, id, onClick, onPositionUpdate }: Sphere3DProps) {
  const meshRef = useRef<Mesh>(null)
  const wireframeRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const targetScaleRef = useRef(scale)
  const currentScaleRef = useRef(scale)
  const lastUpdateTimeRef = useRef(0)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  
  // Determine opacity: blue spheres are solid, white/yellow are transparent
  const isBlue = color.startsWith('#15') || color.startsWith('#0d') || color.startsWith('#42') || color.startsWith('#90') || 
                 color === '#1565c0' || color === '#0d47a1' || color === '#42a5f5' || color === '#90caf9' ||
                 color === '#4a90e2' || color === '#2196f3' || color === '#64b5f6' || color === '#1976d2'
  const sphereOpacity = isBlue ? 0.95 : 0.7
  
  // Animation variables - use deterministic value to avoid hydration mismatch
  const originalY = position[1]
  const [timeOffset] = useState(() => id.charCodeAt(0) * 10)

  useFrame((state, delta) => {
    if (meshRef.current && wireframeRef.current) {
      const time = state.clock.getElapsedTime()
      const { camera, size } = state
      
      // Very subtle floating animation (reduced frequency and amplitude for smoother motion)
      const floatOffset = Math.sin(time * 0.3 + timeOffset) * 0.03
      meshRef.current.position.y = originalY + floatOffset
      wireframeRef.current.position.y = originalY + floatOffset
      
      // Smooth rotation (frame-rate independent, slower for smoother motion)
      const rotSpeed = 0.0015 * delta * 60
      meshRef.current.rotation.x += rotSpeed
      meshRef.current.rotation.y += rotSpeed * 1.5
      wireframeRef.current.rotation.x = meshRef.current.rotation.x
      wireframeRef.current.rotation.y = meshRef.current.rotation.y
      
      // Synchronize wireframe scale - ensure uniform scaling with slight offset
      const wireframeScale = currentScaleRef.current * 0.95
      wireframeRef.current.scale.setScalar(wireframeScale)
      
      // Determine target scale
      if (clicked) {
        targetScaleRef.current = scale * 1.1
      } else if (hovered) {
        targetScaleRef.current = scale * 1.05
      } else {
        targetScaleRef.current = scale
      }
      
      // Smoothly interpolate scale with higher lerp factor for faster response
      currentScaleRef.current = THREE.MathUtils.lerp(
        currentScaleRef.current,
        targetScaleRef.current,
        0.25
      )
      // Use setScalar to ensure uniform x, y, z scaling for perfect roundness
      meshRef.current.scale.setScalar(currentScaleRef.current)

      // Update screen position for UI overlay (smoother with better interpolation)
      if (onPositionUpdate) {
        const now = Date.now()
        // Throttle updates to every 33ms (~30fps) for smoother updates
        if (now - lastUpdateTimeRef.current > 33) {
          const worldPosition = new THREE.Vector3()
          meshRef.current.getWorldPosition(worldPosition)
          
          // Project 3D position to screen coordinates
          const vector = worldPosition.clone().project(camera)
          const x = (vector.x * 0.5 + 0.5) * size.width
          const y = (vector.y * -0.5 + 0.5) * size.height
          
          // Reduced threshold to 2px for smoother tracking
          const positionChanged = !lastPositionRef.current || 
            Math.abs(x - lastPositionRef.current.x) > 2 || 
            Math.abs(y - lastPositionRef.current.y) > 2
          
          if (positionChanged) {
            // Check if sphere is visible (in front of camera and within reasonable distance)
            const distance = worldPosition.distanceTo(camera.position)
            const visible = vector.z < 1 && distance > 0 && distance < 100
            
            lastPositionRef.current = { x, y }
            lastUpdateTimeRef.current = now
            onPositionUpdate(id, { x, y, visible })
          }
        }
      }
    }
  })

  const handleClick = () => {
    onClick(id)
    setClicked(true)
    
    setTimeout(() => {
      setClicked(false)
    }, 200)
  }

  // Determine if this is a large sphere (for geometry resolution)
  const isLargeSphere = scale >= 2.0
  
  // Memoize colors to avoid hydration issues
  const specularColor = useMemo(() => {
    return isBlue ? new THREE.Color(0xffffff) : new THREE.Color(color)
  }, [isBlue, color])
  
  const emissiveColor = useMemo(() => {
    return new THREE.Color(color)
  }, [color])
  
  return (
    <group position={position}>
      {/* Main sphere - Enhanced 3D appearance for all blue spheres */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Higher resolution geometry for large spheres, enhanced for all blue spheres */}
        <sphereGeometry args={isLargeSphere ? [1, 128, 128] : (isBlue ? [1, 96, 96] : [1, 64, 64])} />
        <meshPhongMaterial 
          color={color} 
          shininess={isBlue ? 150 : 120} 
          specular={specularColor}
          transparent={sphereOpacity < 1}
          opacity={sphereOpacity}
          depthWrite={true}
          depthTest={true}
          emissive={emissiveColor}
          emissiveIntensity={isBlue ? 0.2 : 0.2}
          flatShading={false}
        />
      </mesh>
      
      {/* Inner glow layer for all blue spheres - adds depth */}
      {isBlue && (
        <mesh scale={[scale * 0.92, scale * 0.92, scale * 0.92]}>
          <sphereGeometry args={[1, isLargeSphere ? 64 : 48]} />
          <meshPhongMaterial 
            color={color} 
            transparent 
            opacity={0.4}
            emissive={emissiveColor}
            emissiveIntensity={0.3}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>
      )}
      
      {/* Outer rim highlight for all blue spheres - enhances 3D edge */}
      {isBlue && (
        <mesh scale={[scale * 1.02, scale * 1.02, scale * 1.02]}>
          <sphereGeometry args={[1, isLargeSphere ? 64 : 48]} />
          <meshPhongMaterial 
            color={color} 
            transparent 
            opacity={0.15}
            emissive={emissiveColor}
            emissiveIntensity={0.5}
            side={THREE.BackSide}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>
      )}
      
      {/* Wireframe detail - Enhanced for blue spheres */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={isLargeSphere ? [1, 64, 64] : (isBlue ? [1, 48, 48] : [1, 32, 32])} />
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={isBlue ? 0.4 : 0.3} 
          wireframe
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </group>
  )
}