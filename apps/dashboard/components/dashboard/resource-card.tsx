import { ArrowRight, ExternalLink, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ResourceCardProps {
  title: string
  description: string
  href: string
  ctaLabel: string
  external: boolean
  icon: LucideIcon
}

export const ResourceCard = ({
  title,
  description,
  href,
  ctaLabel,
  external,
  icon: Icon,
}: ResourceCardProps) => {
  return (
    <Card className="gap-0 p-5 transition-colors hover:ring-primary/20">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5.5" />
      </span>
      <h3 className="mt-4 text-base font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Button
          variant="link"
          size="sm"
          className="h-auto gap-1 px-0"
          nativeButton={false}
          render={
            external ? (
              <a href={href} target="_blank" rel="noreferrer" />
            ) : (
              <Link href={href} />
            )
          }
        >
          {ctaLabel}
          {external ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}
        </Button>
      </div>
    </Card>
  )
}
