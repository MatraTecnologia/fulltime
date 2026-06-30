import type { ReactNode } from 'react'
import { Label } from './label.js'

interface FieldProps {
  label?: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

export const Field = ({ label, htmlFor, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <Label htmlFor={htmlFor}>{label}</Label>}
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
)
