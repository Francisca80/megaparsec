'use client'

import { useState, useRef, useEffect } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import Scene3D from '../components/Scene3D'
import UIOverlay from '../components/UIOverlay'

export default function Home() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [focusSphereId, setFocusSphereId] = useState<string | null>(null)
  const [spherePositions, setSpherePositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({})
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentFocusRef = useRef<string | null>(null)

  const showPanel = (panelId: string) => {
    setActivePanel((currentPanel) => {
      const willBeActive = currentPanel === panelId ? null : panelId
      
      // Focus camera on the sphere when panel is being activated (not closed)
      if (willBeActive === panelId) {
        // Clear any existing timeout to prevent race condition
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current)
          focusTimeoutRef.current = null
        }
        
        currentFocusRef.current = panelId
        setFocusSphereId(panelId)
        
        // Reset focus after animation completes, but only if this is still the active focus
        focusTimeoutRef.current = setTimeout(() => {
          if (currentFocusRef.current === panelId) {
            setFocusSphereId(null)
            currentFocusRef.current = null
          }
          focusTimeoutRef.current = null
        }, 1500)
      }
      
      return willBeActive
    })
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [])

  const hidePanel = () => {
    setActivePanel(null)
  }

  const handleSpherePositionsChange = (positions: Record<string, { x: number; y: number; visible: boolean }>) => {
    setSpherePositions(positions)
  }

  return (
    <ErrorBoundary>
      <main className="relative w-full h-screen overflow-hidden bg-black" style={{ width: '100vw', height: '100vh', minHeight: '100vh', maxWidth: '100vw', maxHeight: '100vh' }}>
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          {/* 3D Scene */}
          <ErrorBoundary>
            <Scene3D 
              onSphereClick={showPanel}
              onSpherePositionsChange={handleSpherePositionsChange}
              focusSphereId={focusSphereId}
            />
          </ErrorBoundary>
          
          {/* UI Overlay */}
          <ErrorBoundary>
            <UIOverlay 
              activePanel={activePanel}
              onShowPanel={showPanel}
              onHidePanel={hidePanel}
              spherePositions={spherePositions}
            />
          </ErrorBoundary>
        </div>
      </main>
    </ErrorBoundary>
  )
}