import { useState } from 'react'

export const fieldWrap = 'space-y-1.5'
export const labelCls = 'block text-sm font-medium text-brand-navy'
export const inputCls =
  'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-brand-navy transition placeholder:text-brand-navy/35 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-60'
export const primaryBtnCls =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-strong focus:outline-none focus:ring-4 focus:ring-brand-blue/25 disabled:cursor-not-allowed disabled:opacity-70'
export const ghostBtnCls =
  'flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-white px-4 py-3 text-sm font-semibold text-brand-navy transition hover:bg-surface focus:outline-none focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-55'
export const linkCls = 'font-semibold text-brand-blue transition hover:text-brand-blue-strong hover:underline'

export const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
  </svg>
)

type AlertKind = 'error' | 'success'

export const FormAlert = ({ kind, children }: { kind: AlertKind; children: React.ReactNode }) => {
  const styles =
    kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-brand-green/30 bg-brand-green/10 text-brand-green-strong'
  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${styles}`}>
      <span className="mt-0.5 shrink-0">
        {kind === 'error' ? (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="M10 6v4m0 3h.01M10 2.5 2.5 16h15L10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="m5 10.5 3.5 3.5L15 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </span>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  minLength?: number
}

export const TextField = ({ id, label, type = 'text', value, onChange, autoComplete, placeholder, required, minLength }: FieldProps) => (
  <div className={fieldWrap}>
    <label htmlFor={id} className={labelCls}>{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      className={inputCls}
    />
  </div>
)

export const PasswordField = ({ id, label, value, onChange, autoComplete, placeholder, required, minLength }: Omit<FieldProps, 'type'>) => {
  const [show, setShow] = useState(false)
  return (
    <div className={fieldWrap}>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`${inputCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-navy/45 transition hover:bg-surface hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        >
          {show ? (
            <svg className="h-4.5 w-4.5" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8.5 4.2A7.8 7.8 0 0 1 10 4c4.5 0 7.5 4.2 7.5 6 0 .8-.7 2-1.9 3.1M4.4 6.9C3 8 2.5 9.3 2.5 10c0 1.8 3 6 7.5 6 1 0 1.9-.2 2.8-.6M3 3l14 14M8.6 8.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg className="h-4.5 w-4.5" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 10S5.5 4 10 4s7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}

export const GoogleButton = () => (
  <button
    type="button"
    disabled
    title="Em breve"
    className={ghostBtnCls}
  >
    <svg className="h-4.5 w-4.5" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.1-.2-1.7H9v3.3h4.8a4 4 0 0 1-1.8 2.6v2.1h2.9c1.7-1.6 2.7-3.9 2.7-6.3Z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.8v2.3A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.8a9 9 0 0 0 0 8l3.1-2.3Z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .8 5l3.1 2.3C4.6 5.2 6.6 3.6 9 3.6Z"/></svg>
    Entrar com Google
    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-navy/50">Em breve</span>
  </button>
)

export const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-hairline" />
    <span className="text-xs font-medium uppercase tracking-wide text-brand-navy/40">{label}</span>
    <span className="h-px flex-1 bg-hairline" />
  </div>
)
