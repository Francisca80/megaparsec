'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Sphere3D from './Sphere3D'
import DecorativeSphere from './DecorativeSphere'
import { useMousePosition } from '../hooks/useMousePosition'

interface Scene3DProps {
  onSphereClick: (sphereId: string) => void
  onSpherePositionsChange?: (positions: Record<string, { x: number; y: number; visible: boolean }>) => void
  focusSphereId?: string | null
}

// Sphere positions in 3D space
const spherePositions3D: Record<string, [number, number, number]> = {
  orange: [-3, 2, 0],
  red: [0, 0, -2],
  yellow: [3, -2, 1],
  'small-red': [4, 1, 2]
}

export default function Scene3D({ onSphereClick, onSpherePositionsChange, focusSphereId }: Scene3DProps) {
  const mousePosition = useMousePosition()
  const [spherePositions, setSpherePositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({})

  const handlePositionUpdate = (id: string, position: { x: number; y: number; visible: boolean }) => {
    setSpherePositions(prev => ({
      ...prev,
      [id]: position
    }))
  }

  useEffect(() => {
    if (onSpherePositionsChange) {
      onSpherePositionsChange(spherePositions)
    }
  }, [spherePositions, onSpherePositionsChange])

  return (
    <Canvas 
      className="absolute inset-0 z-0 w-full h-full"
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      dpr={[1, 2]}
      style={{ 
        width: '100%', 
        height: '100%', 
        minWidth: '100%', 
        minHeight: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <PerspectiveCamera 
        makeDefault 
        position={[0, 0, 8]} 
        fov={50}
      />
      <CameraAspectUpdater />
      
      {/* Lighting - Mixed blue and warm tones */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[10, 10, 10]} color="#4a90e2" intensity={1.2} />
      <pointLight position={[-10, -10, 5]} color="#ffd700" intensity={1} />
      <pointLight position={[0, 0, -10]} color="#2196f3" intensity={0.8} />
      <pointLight position={[0, 10, 0]} color="#ffeb3b" intensity={0.6} />

      {/* Stars background */}
      <Stars radius={300} depth={60} count={20000} factor={7} />
      
      <Suspense fallback={null}>
        {/* Main spheres - All solid ones are blue tints */}
        <Sphere3D 
          position={[-3, 2, 0]} 
          scale={1.2} 
          color="#1565c0"
          id="orange"
          onClick={onSphereClick}
          onPositionUpdate={handlePositionUpdate}
        />
        <Sphere3D 
          position={[0, 0, -2]} 
          scale={2.5} 
          color="#0d47a1"
          id="red"
          onClick={onSphereClick}
          onPositionUpdate={handlePositionUpdate}
        />
        <Sphere3D 
          position={[3, -2, 1]} 
          scale={1} 
          color="#42a5f5"
          id="yellow"
          onClick={onSphereClick}
          onPositionUpdate={handlePositionUpdate}
        />
        <Sphere3D 
          position={[4, 1, 2]} 
          scale={0.6} 
          color="#90caf9"
          id="small-red"
          onClick={onSphereClick}
          onPositionUpdate={handlePositionUpdate}
        />
        
        {/* Decorative spheres - White and yellow mesh wireframes */}
        <DecorativeSphere 
          position={[-5, -1, 1]} 
          scale={0.8} 
          color="#ffffff"
          id="deco-white-1"
        />
        <DecorativeSphere 
          position={[-4, 3, -1]} 
          scale={0.6} 
          color="#ffd700"
          id="deco-yellow-1"
        />
        <DecorativeSphere 
          position={[5, -3, 0]} 
          scale={0.9} 
          color="#ffffff"
          id="deco-white-2"
        />
        <DecorativeSphere 
          position={[-2, -3, 2]} 
          scale={0.35} 
          color="#ffeb3b"
          id="deco-yellow-2"
        />
        <DecorativeSphere 
          position={[6, 2, -1]} 
          scale={0.7} 
          color="#fff9c4"
          id="deco-yellow-3"
        />
        <DecorativeSphere 
          position={[-1, 4, 1]} 
          scale={0.3} 
          color="#ffffff"
          id="deco-white-3"
        />
        <DecorativeSphere 
          position={[2, 3, -2]} 
          scale={0.75} 
          color="#ffd700"
          id="deco-yellow-4"
        />
        <DecorativeSphere 
          position={[-6, 0, -1]} 
          scale={0.35} 
          color="#ffffff"
          id="deco-white-4"
        />
      </Suspense>
      
      {/* Camera controls */}
      <CameraController mousePosition={mousePosition} focusSphereId={focusSphereId} />
    </Canvas>
  )
}

function CameraAspectUpdater() {
  const { camera, size, gl } = useThree()
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleResize = () => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
        gl.setSize(size.width, size.height)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [camera, size, gl])
  
  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newAspect = size.width / size.height
      if (Math.abs(camera.aspect - newAspect) > 0.001) {
        camera.aspect = newAspect
        camera.updateProjectionMatrix()
      }
    }
  })
  
  return null
}

function CameraController({ mousePosition, focusSphereId }: { mousePosition: { x: number, y: number }, focusSphereId?: string | null }) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const targetRef = useRef<THREE.Vector3 | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  useEffect(() => {
    // Cancel any ongoing animation only when starting a new focus or when focusSphereId changes
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Only start animation if focusSphereId is set and valid
    // If focusSphereId is null, just clean up and return (no unnecessary cancellation)
    if (!focusSphereId) {
      targetRef.current = null
      return
    }
    
    if (spherePositions3D[focusSphereId] && controlsRef.current) {
      const spherePosition = spherePositions3D[focusSphereId]
      const target = new THREE.Vector3(...spherePosition)
      targetRef.current = target
      
      // Smoothly animate OrbitControls target to focus on sphere
      const startTarget = controlsRef.current.target.clone()
      const duration = 1500 // 1.5 seconds
      const startTime = Date.now()
      
      const animate = () => {
        // Check if controlsRef is still valid before accessing
        if (!controlsRef.current) {
          animationFrameRef.current = null
          return
        }
        
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation (ease-out cubic)
        const ease = 1 - Math.pow(1 - progress, 3)
        
        // Interpolate the target position
        controlsRef.current.target.lerpVectors(startTarget, target, ease)
        controlsRef.current.update()
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          targetRef.current = null
          animationFrameRef.current = null
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    // Cleanup function to cancel animation on unmount or when dependencies change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [focusSphereId, camera])
  
  return (
    <OrbitControls 
      ref={controlsRef}
      enableZoom={false} 
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.1}
      rotateSpeed={0.4}
      minDistance={5}
      maxDistance={15}
      autoRotate={false}
    />
  )
}