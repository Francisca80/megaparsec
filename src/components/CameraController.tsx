import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Camera } from 'three';
import { CameraControllerProps } from '../types';

export default function CameraController({ mousePosition }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // Smooth camera movement based on mouse position
    const targetX = mousePosition.x * 2;
    const targetY = mousePosition.y * 2;
    
    // Smooth interpolation
    targetRef.current.x += (targetX - targetRef.current.x) * 0.05;
    targetRef.current.y += (targetY - targetRef.current.y) * 0.05;
    
    // Apply to camera position
    camera.position.x = targetRef.current.x;
    camera.position.y = targetRef.current.y;
    
    // Always look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}