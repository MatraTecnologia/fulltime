"use client"

import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { initials } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { useMyProfile, useUpdateMyProfile } from "@/hooks/use-profile"
import { uploadImage } from "@/services/uploads"
import { Field } from "./settings-shared"

export const ProfileSettings = () => {
  const queryClient = useQueryClient()
  const { data: profile, isPending } = useMyProfile()
  const updateProfile = useUpdateMyProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [area, setArea] = useState("")
  const [registro, setRegistro] = useState("")
  const [instagram, setInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [website, setWebsite] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? "")
    setBio(profile.bio ?? "")
    setArea(profile.area ?? "")
    setRegistro(profile.registro ?? "")
    setInstagram(profile.instagram ?? "")
    setLinkedin(profile.linkedin ?? "")
    setWebsite(profile.website ?? "")
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        bio: bio || null,
        area: area || null,
        registro: registro || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        website: website || null,
      })
      if (name && name !== profile?.name) {
        const { error } = await authClient.updateUser({ name })
        if (error) {
          toast.error(error.message ?? "Não foi possível atualizar o nome.")
          return
        }
      }
      toast.success("Perfil atualizado com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploading(true)
    try {
      const publicUrl = await uploadImage(file)
      const { error } = await authClient.updateUser({ image: publicUrl })
      if (error) {
        toast.error(error.message ?? "Não foi possível atualizar a foto.")
        return
      }
      await queryClient.invalidateQueries({ queryKey: ["me", "profile"] })
      toast.success("Foto atualizada com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

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
            <AvatarImage src={profile?.image ?? undefined} alt={profile?.name ?? ""} />
            <AvatarFallback className="text-lg">{initials(profile?.name ?? "")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
              {uploading ? "Enviando..." : "Alterar foto"}
            </Button>
            <p className="text-xs text-muted-foreground">JPG ou PNG, até 2 MB.</p>
          </div>
        </div>

        <Separator />

        {isPending ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-28" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="profile-name">
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label="E-mail" htmlFor="profile-email">
                <Input id="profile-email" type="email" value={profile?.email ?? ""} readOnly />
              </Field>
            </div>

            <Field label="Bio" htmlFor="profile-bio">
              <Textarea
                id="profile-bio"
                rows={4}
                placeholder="Conte um pouco sobre sua trajetória e o que você ensina."
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Especialidade / Área de atuação" htmlFor="profile-headline">
                <Input
                  id="profile-headline"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                />
              </Field>
              <Field label="Formação" htmlFor="profile-education">
                <Input
                  id="profile-education"
                  placeholder="Ex: Pedagogia — USP"
                  value={registro}
                  onChange={(event) => setRegistro(event.target.value)}
                />
              </Field>
            </div>
          </>
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium">Redes sociais</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Links exibidos no seu perfil público.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="profile-instagram">
            <Input
              id="profile-instagram"
              placeholder="@usuario"
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
            />
          </Field>
          <Field label="LinkedIn" htmlFor="profile-linkedin">
            <Input
              id="profile-linkedin"
              placeholder="linkedin.com/in/usuario"
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />
          </Field>
          <Field label="Site" htmlFor="profile-website" className="sm:col-span-2">
            <Input
              id="profile-website"
              placeholder="https://seusite.com"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isPending || updateProfile.isPending}>
            {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
