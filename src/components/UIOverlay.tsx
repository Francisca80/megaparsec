'use client'

import { motion, AnimatePresence } from 'framer-motion'
import InfoPanel from './InfoPanel'

interface UIOverlayProps {
  activePanel: string | null
  onShowPanel: (panelId: string) => void
  onHidePanel: () => void
}

export default function UIOverlay({ activePanel, onShowPanel, onHidePanel }: UIOverlayProps) {
  const panels = {
    orange: {
      id: 'panel1',
      position: 'top-[20%] left-[10%]',
      content: {
        code: '<br/>',
        text: '5 years in operation',
        code2: '<br/>'
      }
    },
    red: {
      id: 'panel2',
      position: 'top-[60%] left-[20%]',
      content: {
        code: '<a href="as a freelancer"',
        text: 'I work for agencies, companies,\nstartups and individuals all\nover the world">',
        code2: ''
      }
    },
    'small-red': {
      id: 'panel3',
      position: 'top-[30%] right-[15%]',
      content: {
        code: '<br/>',
        text: 'dedicated to functionality',
        code2: '<br/>'
      }
    },
    yellow: {
      id: 'panel4',
      position: 'bottom-[35%] right-[20%]',
      content: {
        code: '<br/>',
        text: 'creative vision',
        code2: '<br/>'
      }
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-mono text-white">
      {/* Header */}
      <div className="absolute top-8 left-8 pointer-events-auto">
        <div className="border-2 border-yellow-500 px-4 py-2 text-sm font-bold text-yellow-500 tracking-wider mb-2">
          MEGAPARSEC
        </div>
        <div className="text-xs text-gray-400 ml-1">
          /*** Light Years Ahead***/
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute top-8 right-8 flex gap-5 pointer-events-auto">
        {['📊', '✓', '📘', '🐦', '≡'].map((icon, index) => (
          <motion.a
            key={index}
            href="#"
            className="text-yellow-500 text-lg hover:opacity-70 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.a>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-8 text-xs text-gray-500 pointer-events-auto">
        Mouse to orbit • Click spheres for info
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-8 right-8 text-2xl text-gray-700 pointer-events-auto">
        1/3
      </div>

      {/* Diamond buttons */}
      <DiamondButton 
        position="top-[25%] left-[35%]" 
        symbol="◊" 
        onClick={() => onShowPanel('orange')} 
      />
      <DiamondButton 
        position="top-[45%] right-[25%]" 
        symbol="○" 
        onClick={() => onShowPanel('small-red')} 
      />
      <DiamondButton 
        position="bottom-[40%] right-[35%]" 
        symbol="◈" 
        onClick={() => onShowPanel('yellow')} 
      />

      {/* Info Panels */}
      <AnimatePresence>
        {activePanel && panels[activePanel as keyof typeof panels] && (
          <InfoPanel
            key={activePanel}
            panel={panels[activePanel as keyof typeof panels]}
            onClose={onHidePanel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface DiamondButtonProps {
  position: string
  symbol: string
  onClick: () => void
}

function DiamondButton({ position, symbol, onClick }: DiamondButtonProps) {
  return (
    <motion.div
      className={`absolute ${position} w-8 h-8 border-2 border-yellow-500 transform rotate-45 flex items-center justify-center cursor-pointer pointer-events-auto`}
      onClick={onClick}
      whileHover={{ 
        borderColor: '#ffffff',
        boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
        scale: 1.1
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="transform -rotate-45 text-xs text-yellow-500">
        {symbol}
      </span>
    </motion.div>
  )
}