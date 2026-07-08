"use client"

import * as React from "react"
import { Award, BadgeCheck, Download, Eye, TrendingUp } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { CertificatePreview } from "@/components/dashboard/certificate-preview"
import type { IssuedCertificate } from "@/lib/mock/certificates"

type Template = {
  id: string
  name: string
  description: string
  active: boolean
}

const templates: Template[] = [
  { id: "tpl_1", name: "Clássico Dourado", description: "Borda dupla e selo central", active: true },
  { id: "tpl_2", name: "Minimalista", description: "Linhas limpas e tipografia sóbria", active: false },
  { id: "tpl_3", name: "Institucional", description: "Cabeçalho e brasão da escola", active: false },
  { id: "tpl_4", name: "Moderno Azul", description: "Destaque em azul-marinho", active: false },
]

export const CertificatesPanel = ({ certificates }: { certificates: IssuedCertificate[] }) => {
  const [tab, setTab] = React.useState("issued")
  const [selectedId, setSelectedId] = React.useState(certificates[0]?.id)

  const selected = certificates.find((c) => c.id === selectedId) ?? certificates[0]

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="issued">Emitidos por mês</TabsTrigger>
          <TabsTrigger value="templates">Modelos de certificado</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total emitidos" value="2.350" icon={Award} />
        <StatCard label="Este mês" value="+320" delta={18} icon={TrendingUp} />
        <StatCard label="Certificados válidos" value="100%" icon={BadgeCheck} />
      </div>

      {tab === "issued" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certificados emitidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {certificates.map((cert) => (
                  <li key={cert.id} className="flex items-center gap-3 px-6 py-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                      <Award className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{cert.courseTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{cert.studentName}</p>
                      <p className="text-xs text-muted-foreground">Emitido em {cert.issuedAt}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setSelectedId(cert.id)}
                      >
                        <Eye className="size-4" />
                        Visualizar
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Baixar certificado">
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-6 lg:self-start">
            {selected && (
              <CertificatePreview
                studentName={selected.studentName}
                courseTitle={selected.courseTitle}
                issuedAt={selected.issuedAt}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="gap-0 overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center border-b border-brand-gold/30 bg-[oklch(0.99_0.02_85)] p-4 dark:bg-brand-gold/5">
                <div className="flex w-full flex-col items-center gap-1.5 rounded-md border-2 border-brand-gold/40 px-4 py-5">
                  <Award className="size-6 text-brand-gold" />
                  <span className="text-[0.6rem] font-bold tracking-widest text-brand-navy">
                    CERTIFICADO
                  </span>
                  <span className="h-1 w-8 rounded bg-brand-gold/40" />
                  <span className="h-1 w-12 rounded bg-muted" />
                </div>
              </div>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  </div>
                  <Badge variant={tpl.active ? "default" : "secondary"}>
                    {tpl.active ? "Ativo" : "Disponível"}
                  </Badge>
                </div>
                <Button variant={tpl.active ? "secondary" : "outline"} size="sm" className="w-full">
                  Usar modelo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
