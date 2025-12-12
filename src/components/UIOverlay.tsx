'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import InfoPanel from './InfoPanel'

interface UIOverlayProps {
  activePanel: string | null
  onShowPanel: (panelId: string) => void
  onHidePanel: () => void
  spherePositions?: Record<string, { x: number; y: number; visible: boolean }>
}

export default function UIOverlay({ activePanel, onShowPanel, onHidePanel, spherePositions = {} }: UIOverlayProps) {
  const [adjustedPositions, setAdjustedPositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({})
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 })
  const rafId = useRef<number | null>(null)
  const [centeredPanel, setCenteredPanel] = useState<string | null>(null)
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)

  // Update viewport size
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  // Collision detection and adjustment
  const detectAndResolveCollisions = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    
    rafId.current = requestAnimationFrame(() => {
      const bounds: Array<{ id: string; x: number; y: number; width: number; height: number }> = []
      const minDistance = 180 // Minimum distance between panel centers
      const padding = 20

      // Collect all panel bounds from DOM
      Object.entries(spherePositions).forEach(([key, pos]) => {
        if (pos.visible && panelRefs.current[key]) {
          const rect = panelRefs.current[key]?.getBoundingClientRect()
          if (rect && rect.width > 0 && rect.height > 0) {
            bounds.push({
              id: key,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              width: rect.width,
              height: rect.height
            })
          }
        }
      })

      // If we don't have enough rendered panels, use original positions
      if (bounds.length < 2) {
        setAdjustedPositions(spherePositions)
        return
      }

      // Check for collisions and adjust positions
      const adjusted: Record<string, { x: number; y: number; visible: boolean }> = { ...spherePositions }
      const adjustments: Record<string, { dx: number; dy: number }> = {}

      // Initialize adjustments
      Object.keys(spherePositions).forEach(key => {
        adjustments[key] = { dx: 0, dy: 0 }
      })

      // Detect collisions and calculate separation vectors
      for (let i = 0; i < bounds.length; i++) {
        for (let j = i + 1; j < bounds.length; j++) {
          const panel1 = bounds[i]
          const panel2 = bounds[j]
          
          const dx = panel2.x - panel1.x
          const dy = panel2.y - panel1.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Check if panels are too close
          const combinedRadius = (panel1.width + panel2.width) / 2 + minDistance
          
          if (distance < combinedRadius && distance > 0) {
            // Calculate separation needed
            const separation = combinedRadius - distance
            const angle = Math.atan2(dy, dx)
            
            // Move panels apart proportionally
            const moveX = Math.cos(angle) * separation * 0.5
            const moveY = Math.sin(angle) * separation * 0.5
            
            adjustments[panel1.id].dx -= moveX
            adjustments[panel1.id].dy -= moveY
            adjustments[panel2.id].dx += moveX
            adjustments[panel2.id].dy += moveY
          }
        }
      }

      // Apply adjustments with viewport clamping
      Object.entries(spherePositions).forEach(([key, pos]) => {
        if (pos.visible && adjustments[key]) {
          const panelWidth = bounds.find(b => b.id === key)?.width || 200
          const panelHeight = bounds.find(b => b.id === key)?.height || 200
          
          const newX = Math.max(
            padding + panelWidth / 2,
            Math.min(
              pos.x + adjustments[key].dx,
              viewportSize.width - panelWidth / 2 - padding
            )
          )
          
          const newY = Math.max(
            padding + panelHeight / 2,
            Math.min(
              pos.y + adjustments[key].dy,
              viewportSize.height - panelHeight / 2 - padding
            )
          )
          
          adjusted[key] = {
            ...pos,
            x: newX,
            y: newY
          }
        }
      })

      setAdjustedPositions(adjusted)
    })
  }, [spherePositions, viewportSize])

  // Update adjusted positions when sphere positions or viewport changes
  useEffect(() => {
    // Small delay to allow DOM to update
    const timeout = setTimeout(() => {
      detectAndResolveCollisions()
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [detectAndResolveCollisions])

  const panels = {
    orange: {
      id: 'panel1',
      position: 'top-[12%] left-[6%]',
      title: 'Training',
      content: {
        text: 'At Megaparsec we provide education, training and exam preparations tailored to our customers requirements.',
        text2: 'Subjects range include Amazon Web Services, Architecting and Observability.'
      },
      icon: '◊'
    },
    red: {
      id: 'panel2',
      position: 'bottom-[20%] left-[10%]',
      title: 'Consultancy',
      content: {
        text: 'Whether you need help migrating your current workloads to the cloud ',
        text2: 'or want to implement a greenfield project,',
        text3: 'Megaparsec can help you from start to finish. ',
        text4: "We have extensive experience with bringing existing infrastructure to the cloud or expanding and improving existing cloud infrastructures."
      },
      icon: '○'
    },
    'small-red': {
      id: 'panel3',
      position: 'top-[22%] right-[10%]',
      title: 'Architecture',
      content: {
        text: 'If you need help with creating functional or technical designs ',
        text2: 'Megaparsec is the partner you\'re looking for.',
        text3: 'We can help you design cloud native architectures from scratch or create a plan to redesign, replatform or rehost your IT landscape.',
        text4: 'We have extensive experience with bringing existing infrastructure to the cloud or expanding and improving existing cloud infrastructures.'
      },
      icon: '◉'
    },
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 font-mono text-white w-full h-full overflow-hidden" style={{ maxWidth: '100%', maxHeight: '100%' }}>
      {/* Header with Logo - Responsive */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 pointer-events-auto">
        <div className="mb-1 sm:mb-2">
          <img 
            src="/MPS1.png" 
            alt="Megaparsec Logo" 
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            style={{ maxHeight: '48px' }}
            loading="eager"
            width={120}
            height={48}
          />
        </div>
        <div className="text-sm sm:text-base md:text-lg text-white ml-1 font-semibold">
          Lightyears Ahead
        </div>
      </div>

      {/* Navigation - Responsive */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-3 sm:gap-4 pointer-events-auto items-center">
        <motion.a
          href="https://www.linkedin.com/company/megaparsec"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-500 hover:opacity-70 transition-opacity touch-manipulation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="LinkedIn"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </motion.a>
        <motion.a
          href="mailto:info@megaparsec.org"
          className="text-yellow-500 hover:opacity-70 transition-opacity touch-manipulation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Email"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </motion.a>
        <div className="w-6 sm:w-8 h-0.5 bg-yellow-500 ml-1 sm:ml-2"></div>
      </div>

      {/* Navigation Links - Right Side - Responsive */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-8 pointer-events-auto font-mono z-[100]" style={{ zIndex: 100 }}>
        <div className="flex flex-col gap-2 sm:gap-3 text-[10px] sm:text-xs">
          <span className="text-gray-500 mb-1">Mouse to orbit</span>
          {Object.entries(panels).map(([key, panel]) => (
            <motion.button
              key={key}
              onClick={() => {
                const wasActive = activePanel === key
                onShowPanel(key)
                // Only center/position under logo if opening the panel (not closing)
                if (!wasActive) {
                  // Center the panel on screen when clicked from menu
                  setCenteredPanel(key)
                  // Reset after animation completes, allowing smooth transition back
                  setTimeout(() => setCenteredPanel(null), 2500)
                } else {
                  // If closing, clear centered state immediately
                  setCenteredPanel(null)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const wasActive = activePanel === key
                  onShowPanel(key)
                  if (!wasActive) {
                    setCenteredPanel(key)
                    setTimeout(() => setCenteredPanel(null), 2500)
                  } else {
                    setCenteredPanel(null)
                  }
                }
              }}
              className={`text-yellow-500/80 hover:text-yellow-400 focus:text-white active:text-white focus:outline-none transition-colors touch-manipulation text-left ${
                activePanel === key ? 'text-yellow-400 font-semibold' : ''
              }`}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Show ${panel.title} panel`}
              aria-pressed={activePanel === key}
            >
              {panel.title}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Contact Information Overlay - Bottom Left - Responsive */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 pointer-events-auto font-mono max-w-[90%] sm:max-w-none">
        <div className="flex flex-col gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
          <div className="text-yellow-500/80 font-mono">
            &lt;address&gt;
          </div>
          <div className="text-white/90 font-mono ml-2 break-words">
            Bergfluiter 7
          </div>
          <div className="text-white/90 font-mono ml-2 break-words">
            3435AT Nieuwegein, Netherlands
          </div>
          <div className="text-yellow-500/80 font-mono">
            &lt;/address&gt;
          </div>
          <div className="text-yellow-500/80 font-mono mt-1 sm:mt-2">
            &lt;contact&gt;
          </div>
          <a 
            href="mailto:info@megaparsec.org"
            className="text-white/90 font-mono ml-2 break-all hover:text-yellow-400 transition-colors underline"
          >
            info@megaparsec.org
          </a>
          <div className="text-white/90 font-mono ml-2">
            KVK: 77621966
          </div>
          <div className="text-yellow-500/80 font-mono">
            &lt;/contact&gt;
          </div>
        </div>
      </div>

      {/* About Information Overlay - Bottom Right - Responsive */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 pointer-events-auto font-mono max-w-[90%] sm:max-w-[500px] md:max-w-[600px]">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          {/* Header with Title - Always visible */}
          <motion.button
            className="flex items-center gap-2 sm:gap-3 cursor-pointer touch-manipulation w-full text-left focus:outline-none focus:text-white active:text-white"
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsAboutExpanded(!isAboutExpanded)
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-expanded={isAboutExpanded}
            aria-label={`${isAboutExpanded ? 'Collapse' : 'Expand'} About section`}
          >
            <div className="text-yellow-400 font-mono text-sm sm:text-base md:text-lg font-bold">
              About
            </div>
            {/* Expand/Collapse indicator */}
            <motion.div
              className="text-yellow-500/60 text-xs sm:text-sm font-mono ml-auto"
              animate={{ rotate: isAboutExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.div>
          </motion.button>
          
          {/* Collapsible Content Panel */}
          <AnimatePresence>
            {isAboutExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-white/90 font-mono">
                  <div className="break-words">
                    Megaparsec is a consultancy company for Cloud Engineering. We advise our customers and deliver training on designing and building IT infrastructure in a cloud native way.
                  </div>
                  <div className="break-words">
                    We have worked with customers in Education, Energy, Finance, Government, Telco and TV industries but are always looking for new and interesting challenges.
                  </div>
                  <div className="break-words">
                    Megaparsec was founded in 2020 but has extensive experience in the operational, development and architectural side of IT which spans multiple decades.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      {/* Info Panels - Always visible with integrated icons, attached to spheres */}
      {Object.entries(panels).map(([key, panel]) => {
        // Use adjusted position if available, otherwise use original sphere position
        let spherePos = adjustedPositions[key] || spherePositions[key]
        
        // If this panel should be centered (clicked via link) and is currently active
        if (centeredPanel === key && activePanel === key) {
          const isMobile = viewportSize.width < 768
          
          if (isMobile) {
            // On mobile, position under the logo
            // Logo area: top-4 (16px) + logo height (~48px) + margin (4px) + text height (~20px) = ~88px
            // Left: left-4 (16px) + some spacing
            spherePos = {
              x: 16 + 120, // left offset + half panel width estimate (240px / 2)
              y: 88, // below logo and "Lightyears Ahead" text
              visible: true
            }
          } else {
            // On desktop, center the panel
            spherePos = {
              x: viewportSize.width / 2,
              y: viewportSize.height / 2,
              visible: true
            }
          }
        }
        // If centeredPanel is cleared or panel is not active, use normal sphere position
        // This allows smooth transition back to sphere position
        
        
        return (
          <div 
            key={key} 
            ref={(el) => { 
              if (el) {
                panelRefs.current[key] = el
              }
            }}
            className="absolute z-40"
          >
            <InfoPanel
              panel={panel}
              isActive={activePanel === key}
              onClose={() => onShowPanel(key)}
              spherePosition={spherePos}
            />
          </div>
        )
      })}
    </div>
  )
}
