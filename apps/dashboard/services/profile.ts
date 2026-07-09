import { api } from "@/lib/api"

export interface MyProfile {
  name: string
  email: string
  image: string | null
  area: string | null
  registro: string | null
  bio: string | null
  instagram: string | null
  linkedin: string | null
  website: string | null
}

export interface UpdateMyProfileBody {
  area?: string | null
  registro?: string | null
  bio?: string | null
  instagram?: string | null
  linkedin?: string | null
  website?: string | null
}

export const getMyProfile = async (): Promise<MyProfile> => {
  const { data } = await api.get<MyProfile>("/me/profile")
  return data
}

export const updateMyProfile = async (body: UpdateMyProfileBody): Promise<MyProfile> => {
  const { data } = await api.put<MyProfile>("/me/profile", body)
  return data
}
