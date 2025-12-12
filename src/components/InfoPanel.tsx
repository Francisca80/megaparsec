'use client'

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface InfoPanelProps {
  panel: {
    id: string
    position: string
    title: string
    content: {
      text: string
      text2?: string
      text3?: string
      text4?: string
    }
    icon?: string | null
  }
  isActive?: boolean
  onClose: () => void
  spherePosition?: { x: number; y: number; visible: boolean }
}

export default function InfoPanel({ panel, isActive, onClose, spherePosition }: InfoPanelProps) {
  // Start with false to avoid hydration mismatch - consistent on server and client
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 })
  const [isMounted, setIsMounted] = useState(false)
  
  // Use sphere screen position if available, otherwise fall back to CSS position
  const useScreenPosition = spherePosition !== undefined
  
  // Smooth position values using spring physics
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const opacity = useMotionValue(1) // Start visible
  
  // Smoother springs for position (higher damping, lower stiffness for ultra-smooth motion)
  const springX = useSpring(x, { stiffness: 100, damping: 60, mass: 1 })
  const springY = useSpring(y, { stiffness: 100, damping: 60, mass: 1 })
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 50, mass: 1 })

  // Set mounted state after mount to avoid hydration mismatch
  // Expanded on desktop (>= 640px), collapsed on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsMounted(true)
    // Set expanded state based on screen size
    const width = window.innerWidth
    setIsExpanded(width >= 640) // sm breakpoint - expanded on desktop
  }, [])

  // Update viewport size on resize and adjust expanded state
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setViewportSize({ width, height })
      // Auto-expand on desktop, collapse on mobile
      setIsExpanded((prevExpanded) => {
        if (width >= 640 && !prevExpanded) {
          return true
        } else if (width < 640 && prevExpanded) {
          return false
        }
        return prevExpanded
      })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [isMounted])

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (useScreenPosition && spherePosition) {
      // Use a timeout to ensure DOM is ready, then get actual dimensions
      const updatePosition = () => {
        if (!panelRef.current) {
          // If ref not ready, use estimated dimensions
          const isAboutPanel = panel.title === 'About'
          const estimatedWidth = isAboutPanel ? 700 : 300
          const estimatedHeight = isExpanded ? (isAboutPanel ? 250 : 200) : 50
          const padding = 20
          
          const clampedX = Math.max(
            estimatedWidth / 2 + padding,
            Math.min(spherePosition.x, viewportSize.width - estimatedWidth / 2 - padding)
          )
          
          // For About panel, position it higher to avoid falling off screen
          const yOffset = isAboutPanel ? -80 : 50
          const minY = isAboutPanel ? estimatedHeight + padding + 20 : estimatedHeight + padding
          
          const clampedY = Math.max(
            minY,
            Math.min(spherePosition.y + yOffset, viewportSize.height - estimatedHeight - padding)
          )
          
          x.set(clampedX)
          y.set(clampedY)
          opacity.set(spherePosition.visible ? 1 : 0.8)
          return
        }

        // Get actual panel dimensions from DOM
        const rect = panelRef.current.getBoundingClientRect()
        const isAboutPanel = panel.title === 'About'
        const panelWidth = rect.width > 0 ? rect.width : (isAboutPanel ? 700 : 300)
        const panelHeight = rect.height > 0 ? rect.height : (isExpanded ? (isAboutPanel ? 250 : 200) : 50)
        const padding = 20
        
        // Clamp X position (center of panel)
        const clampedX = Math.max(
          panelWidth / 2 + padding,
          Math.min(spherePosition.x, viewportSize.width - panelWidth / 2 - padding)
        )
        
        // Clamp Y position (top of panel, accounting for panel height)
        // For About panel, position it higher to avoid falling off screen
        const yOffset = isAboutPanel ? -80 : 50
        const minY = isAboutPanel ? panelHeight + padding + 20 : panelHeight + padding
        
        const clampedY = Math.max(
          minY,
          Math.min(spherePosition.y + yOffset, viewportSize.height - panelHeight - padding)
        )
        
        x.set(clampedX)
        y.set(clampedY)
        opacity.set(spherePosition.visible ? 1 : 0.8)
      }

      // Initial update
      updatePosition()
      
      // Update again after a short delay to get accurate dimensions
      const timeout = setTimeout(updatePosition, 50)
      
      return () => clearTimeout(timeout)
    } else if (!useScreenPosition) {
      // Ensure panels are visible when using CSS position
      opacity.set(1)
    }
  }, [spherePosition, useScreenPosition, x, y, opacity, viewportSize, isExpanded])

  const style = useScreenPosition
    ? {
        position: 'absolute' as const,
        left: springX,
        top: springY,
        transform: 'translate(-50%, 0)',
        opacity: springOpacity,
        width: 'fit-content',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'calc(100vh - 2rem)'
      }
    : {
        position: 'absolute' as const,
        width: 'fit-content',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'calc(100vh - 2rem)'
      }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      ref={panelRef}
      className={`absolute ${useScreenPosition ? '' : panel.position} pointer-events-auto`}
      style={style}
      initial={false}
      animate={useScreenPosition ? false : { opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2">
        {/* Header with Title - Always visible */}
        <motion.button
          className="flex items-center gap-2 sm:gap-3 cursor-pointer touch-manipulation w-full text-left focus:outline-none focus:text-white active:text-white"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggle(e as any)
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${panel.title} panel`}
        >
          {/* Title - Bigger and Bold */}
          <div className="text-yellow-400 font-mono text-sm sm:text-base md:text-lg font-bold leading-tight whitespace-nowrap max-w-[150px] sm:max-w-none truncate sm:truncate-none">
            {panel.title}
          </div>
          
          {/* Expand/Collapse indicator */}
          <motion.div
            className="text-yellow-500/60 text-xs sm:text-sm font-mono ml-auto"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.div>
        </motion.button>

        {/* Collapsible Content Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`flex flex-col gap-0.5 text-left font-mono pl-2 w-fit ${panel.title === 'About' ? 'max-w-[min(800px,calc(100vw-2rem))]' : 'max-w-[calc(100vw-8rem)]'}`}>
                <div className={`text-white/90 font-mono ${panel.title === 'About' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'} leading-tight break-words`}>
                  {panel.content.text}
                </div>
                {panel.content.text2 && (
                  <div className={`text-white/90 font-mono ${panel.title === 'About' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'} leading-tight break-words`}>
                    {panel.content.text2}
                  </div>
                )}
                {panel.content.text3 && (
                  <div className={`text-white/90 font-mono ${panel.title === 'About' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'} leading-tight break-words`}>
                    {panel.content.text3}
                  </div>
                )}
                {panel.content.text4 && (
                  <div className={`text-white/90 font-mono ${panel.title === 'About' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'} leading-tight break-words`}>
                    {panel.content.text4}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}