'use client'

import { useState } from 'react'
import Scene3D from '../components/Scene3D'
import UIOverlay from '../components/UIOverlay'

export default function Home() {
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const showPanel = (panelId: string) => {
    setActivePanel(panelId)
  }

  const hidePanel = () => {
    setActivePanel(null)
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene3D onSphereClick={showPanel} />
      
      {/* UI Overlay */}
      <UIOverlay 
        activePanel={activePanel}
        onShowPanel={showPanel}
        onHidePanel={hidePanel}
      />
    </main>
  )
}