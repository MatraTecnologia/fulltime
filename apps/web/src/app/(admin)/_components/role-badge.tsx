import type { Role } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const ROLE_STYLES: Record<Role, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-brand-purple/12 text-brand-purple-strong' },
  instrutor: { label: 'Instrutor', className: 'bg-brand-blue/12 text-brand-blue-strong' },
  profissional: { label: 'Profissional', className: 'bg-brand-green/12 text-brand-green-strong' },
}

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'instrutor', label: 'Instrutor' },
  { value: 'profissional', label: 'Profissional' },
]

export const RoleBadge = ({ role }: { role: Role | null }) => {
  if (!role) return <Badge className="bg-muted text-muted-foreground">Sem papel</Badge>
  const { label, className } = ROLE_STYLES[role]
  return <Badge className={className}>{label}</Badge>
}

export const StatusBadge = ({ active }: { active: boolean }) =>
  active ? (
    <Badge className="bg-brand-green/12 text-brand-green-strong">Ativo</Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground">Inativo</Badge>
  )
