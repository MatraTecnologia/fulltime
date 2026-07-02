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
    <div role="tablist" className="flex border-b border-hairline">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`${uid}tab-${tab.id}`}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={cn(
            '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
            tab.id === active
              ? 'border-brand-amber text-brand-navy'
              : 'border-transparent text-muted-foreground hover:text-brand-navy',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
