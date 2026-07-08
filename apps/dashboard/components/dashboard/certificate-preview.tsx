import { Award } from "lucide-react"
import { Card } from "@/components/ui/card"

export const CertificatePreview = ({
  studentName,
  courseTitle,
  issuedAt,
}: {
  studentName: string
  courseTitle: string
  issuedAt: string
}) => {
  return (
    <Card className="items-center gap-0 border-2 border-brand-gold/40 bg-[oklch(0.99_0.02_85)] p-8 text-center dark:bg-brand-gold/5">
      <span className="text-[0.7rem] font-semibold tracking-[0.35em] text-brand-gold">
        FULL TIME
      </span>

      <span className="mt-4 flex size-16 items-center justify-center rounded-full border-2 border-brand-gold/50 bg-brand-gold/15 text-brand-gold">
        <Award className="size-8" />
      </span>

      <h2 className="mt-4 text-3xl font-bold tracking-widest text-brand-navy">
        CERTIFICADO
      </h2>
      <span className="mt-1 mb-6 block h-0.5 w-16 bg-brand-gold/50" />

      <p className="text-sm text-muted-foreground">Este certificado é concedido a</p>
      <p
        className="mt-2 text-2xl font-semibold text-brand-navy"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {studentName}
      </p>

      <p className="mt-4 max-w-sm text-sm text-muted-foreground">
        pela conclusão do curso{" "}
        <span className="font-medium text-foreground">{courseTitle}</span>
      </p>

      <p className="mt-4 text-xs tracking-wide text-muted-foreground">
        Emitido em {issuedAt}
      </p>

      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-8">
        <div className="border-t border-foreground/30 pt-2 text-xs text-muted-foreground">
          Instrutor
        </div>
        <div className="border-t border-foreground/30 pt-2 text-xs text-muted-foreground">
          Diretor
        </div>
      </div>
    </Card>
  )
}
