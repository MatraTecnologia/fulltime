import { useEffect, useRef, useState } from 'react'
import { FormAlert, Spinner, primaryBtnCls, linkCls, inputCls } from './ui'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30
const boxCls = `${inputCls.replace('w-full ', '')} h-14 w-12 text-center text-xl font-semibold tracking-tight`

export const OtpForm = () => {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const focusInput = (index: number) => {
    inputs.current[index]?.focus()
    inputs.current[index]?.select()
  }

  const onChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setError(''); setSuccess(false)
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1)
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
    if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); focusInput(index - 1) }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) { e.preventDefault(); focusInput(index + 1) }
  }

  const onPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < pasted.length && index + i < OTP_LENGTH; i++) next[index + i] = pasted[i]
      return next
    })
    setError(''); setSuccess(false)
    const last = Math.min(index + pasted.length, OTP_LENGTH - 1)
    focusInput(last)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (digits.some((d) => d === '')) {
      setSuccess(false)
      setError('Digite os 6 dígitos do código.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 900)
  }

  const onResend = () => {
    setDigits(Array(OTP_LENGTH).fill(''))
    setError(''); setSuccess(false)
    setSeconds(RESEND_SECONDS)
    focusInput(0)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Código de verificação">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => onChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={(e) => onPaste(index, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Dígito ${index + 1}`}
              className={boxCls}
            />
          ))}
        </div>

        {error && <FormAlert kind="error"><p>{error}</p></FormAlert>}
        {success && <FormAlert kind="success"><p>Código verificado. Redirecionando…</p></FormAlert>}

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Verificando…' : 'Confirmar código'}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {seconds > 0 ? (
          <span>
            Reenviar código em <span className="font-semibold text-brand-navy">{seconds}s</span>
          </span>
        ) : (
          <button type="button" onClick={onResend} className={linkCls}>Reenviar código</button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <a href="/login" className={linkCls}>Voltar para o login</a>
      </p>
    </div>
  )
}
