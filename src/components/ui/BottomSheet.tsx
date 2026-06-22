'use client'
import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  height?: string
}

export function BottomSheet({ isOpen, onClose, title, subtitle, children, height = '85vh' }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      {/* Overlay */}
      <div
        className="sheet-overlay"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="sheet-panel"
        style={{ maxHeight: height }}
      >
        {/* Handle */}
        <div className="sheet-handle" />

        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 pt-2 pb-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
            {title && (
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 pb-10 overflow-y-auto" style={{ maxHeight: 'calc(' + height + ' - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
