'use client'

import { motion } from 'framer-motion'

interface InfoPanelProps {
  panel: {
    id: string
    position: string
    content: {
      code: string
      text: string
      code2: string
    }
  }
  onClose: () => void
}

export default function InfoPanel({ panel, onClose }: InfoPanelProps) {
  return (
    <motion.div
      className={`absolute ${panel.position} bg-black bg-opacity-80 border border-orange-500 p-4 text-xs max-w-xs pointer-events-auto`}
      initial={{ opacity: 0, y: 20 }}   
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div className="flex flex-col gap-2">
        <div className="text-orange-500">{panel.content.code}</div>
        <div className="text-white">{panel.content.text}</div>
        <div className="text-orange-500">{panel.content.code2}</div>
      </div>
    </motion.div>
  )
}