'use client'

import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Link2, Loader2, Upload, X } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { uploadCoverImage } from '@/lib/upload'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CoverImageFieldProps {
  value: string
  onChange: (url: string) => void
}

type Mode = 'upload' | 'url'

const CoverImageField = ({ value, onChange }: CoverImageFieldProps) => {
  const [mode, setMode] = useState<Mode>('upload')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const url = await uploadCoverImage(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    void handleFile(e.dataTransfer.files?.[0])
  }

  const preview = value ? (
    <div className="group relative overflow-hidden rounded-card ring-1 ring-brand-navy/[0.08]">
      <img src={value} alt="Capa do curso" className="aspect-video w-full object-cover" />
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-brand-navy/70 text-white opacity-0 transition-opacity hover:bg-brand-navy group-hover:opacity-100"
        aria-label="Remover capa"
      >
        <X className="size-4" />
      </button>
    </div>
  ) : null

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-brand-navy">Imagem de capa</span>
        <div className="inline-flex rounded-lg bg-brand-navy-50 p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
              mode === 'upload' ? 'bg-white text-brand-navy shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Upload className="size-3.5" />
            Enviar
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
              mode === 'url' ? 'bg-white text-brand-navy shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Link2 className="size-3.5" />
            URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
          {preview}
        </>
      ) : value ? (
        <>
          {preview}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="self-start text-xs font-semibold text-brand-blue hover:underline disabled:opacity-60"
          >
            {uploading ? 'Enviando...' : 'Trocar imagem'}
          </button>
        </>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 text-center transition-colors',
            dragging ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-navy/15 hover:border-brand-navy/30',
            uploading && 'pointer-events-none opacity-70',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-7 animate-spin text-brand-blue" />
              <p className="text-sm font-medium text-brand-blue-strong">Enviando imagem...</p>
            </>
          ) : (
            <>
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy">
                <ImagePlus className="size-5" />
              </span>
              <p className="text-sm font-semibold text-brand-navy">Arraste uma imagem ou clique para enviar</p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou WebP</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = '' }}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default CoverImageField
