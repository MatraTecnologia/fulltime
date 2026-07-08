import { LifeBuoy, Mail, MessageCircle } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { ResourceCard } from "@/components/dashboard/resource-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faq, resources } from "@/lib/mock/resources"

const ResourcesPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Recursos"
        description="Guias, tutoriais e suporte para você crescer como instrutor."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} {...resource} />
        ))}
      </div>

      <Card className="gap-0 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="size-5.5" />
          </span>
          <div>
            <h2 className="text-base font-medium">Precisa de ajuda?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A equipe da Matra Tecnologia está pronta para te atender em horário comercial.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
          <Button
            className="gap-1.5"
            nativeButton={false}
            render={<a href="mailto:matratecnologia@gmail.com" />}
          >
            <Mail className="size-4" />
            matratecnologia@gmail.com
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            nativeButton={false}
            render={<a href="https://wa.me/5543999140409" target="_blank" rel="noreferrer" />}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </Button>
        </div>
      </Card>

      <Card className="gap-0 p-6">
        <h2 className="text-base font-medium">Perguntas frequentes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Respostas rápidas para as dúvidas mais comuns dos instrutores.
        </p>
        <Accordion className="mt-4" multiple={false}>
          {faq.map((item) => (
            <AccordionItem key={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  )
}

export default ResourcesPage
