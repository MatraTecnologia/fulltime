"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api"
import { useVideos } from "@/hooks/use-videos"
import { createVideoUpload, uploadVideoToMux } from "@/services/videos"
import { VideoQueue, type ActiveUpload } from "@/components/dashboard/videos/video-queue"
import { VideoLibrary } from "@/components/dashboard/videos/video-library"

export const VideosConnected = () => {
  const qc = useQueryClient()
  const { data: videos, isLoading } = useVideos()
  const [tab, setTab] = React.useState("queue")
  const [uploads, setUploads] = React.useState<ActiveUpload[]>([])

  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setTab("queue")

    for (const file of Array.from(fileList)) {
      const tempId = crypto.randomUUID()
      setUploads((prev) => [...prev, { tempId, name: file.name, progress: 0 }])
      try {
        const up = await createVideoUpload({ filename: file.name })
        await uploadVideoToMux(up.uploadUrl, file, (percent) =>
          setUploads((prev) => prev.map((u) => (u.tempId === tempId ? { ...u, progress: percent } : u)))
        )
        qc.invalidateQueries({ queryKey: ["videos"] })
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Falha ao enviar o vídeo."))
      } finally {
        setUploads((prev) => prev.filter((u) => u.tempId !== tempId))
      }
    }
  }

  const queued = (videos ?? []).filter((v) => v.status !== "READY")
  const ready = (videos ?? []).filter((v) => v.status === "READY")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
        <Button className="gap-1.5" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="size-4" />
          Enviar vídeo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="queue">Fila ({uploads.length + queued.length})</TabsTrigger>
            <TabsTrigger value="library">Biblioteca ({ready.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="queue" className="mt-6">
            <VideoQueue uploads={uploads} items={queued} />
          </TabsContent>
          <TabsContent value="library" className="mt-6">
            <VideoLibrary items={ready} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
