'use client'

import { useId } from 'react'
import { cn } from '../lib/cn.js'

interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
}

export const Tabs = ({ tabs, active, onChange }: TabsProps) => {
  const uid = useId()

  return (
    <div role="tablist" className="flex border-b border-brand-navy/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`${uid}tab-${tab.id}`}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            tab.id === active
              ? 'border-b-2 border-brand-amber text-brand-navy'
              : 'text-slate-500 hover:text-brand-navy',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
