import { Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { initials } from "@/lib/utils"
import { instructorProfile } from "@/lib/mock/instructor"
import { Field } from "./settings-shared"

export const ProfileSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil público</CardTitle>
        <CardDescription>
          Essas informações aparecem para seus alunos na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={instructorProfile.avatarUrl ?? undefined} alt={instructorProfile.name} />
            <AvatarFallback className="text-lg">{initials(instructorProfile.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Camera className="size-4" />
              Alterar foto
            </Button>
            <p className="text-xs text-muted-foreground">JPG ou PNG, até 2 MB.</p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="profile-name">
            <Input id="profile-name" defaultValue={instructorProfile.name} />
          </Field>
          <Field label="E-mail" htmlFor="profile-email">
            <Input id="profile-email" type="email" defaultValue={instructorProfile.email} />
          </Field>
        </div>

        <Field label="Bio" htmlFor="profile-bio">
          <Textarea
            id="profile-bio"
            rows={4}
            placeholder="Conte um pouco sobre sua trajetória e o que você ensina."
            defaultValue="Especialista em educação inclusiva com mais de 10 anos de experiência formando professores para salas diversificadas."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Especialidade / Área de atuação" htmlFor="profile-headline">
            <Input id="profile-headline" defaultValue={instructorProfile.headline} />
          </Field>
          <Field label="Formação" htmlFor="profile-education">
            <Input id="profile-education" placeholder="Ex: Pedagogia — USP" defaultValue="Pedagogia — USP" />
          </Field>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium">Redes sociais</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Links exibidos no seu perfil público.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="profile-instagram">
            <Input id="profile-instagram" placeholder="@usuario" />
          </Field>
          <Field label="LinkedIn" htmlFor="profile-linkedin">
            <Input id="profile-linkedin" placeholder="linkedin.com/in/usuario" />
          </Field>
          <Field label="Site" htmlFor="profile-website" className="sm:col-span-2">
            <Input id="profile-website" placeholder="https://seusite.com" />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="button">Salvar alterações</Button>
        </div>
      </CardContent>
    </Card>
  )
}
