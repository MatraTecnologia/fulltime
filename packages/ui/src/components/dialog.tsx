'use client'

import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '../lib/cn.js'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn('relative z-10 w-full max-w-md rounded-card bg-white p-6 shadow-xl')}
      >
        {title && (
          <h2 id={titleId} className="mb-4 font-display text-lg font-bold text-brand-navy">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
