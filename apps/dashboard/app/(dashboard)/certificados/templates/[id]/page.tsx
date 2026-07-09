import { TemplateEditor } from "@/components/dashboard/certificate-templates/template-editor"

const TemplateEditorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return <TemplateEditor id={id} />
}

export default TemplateEditorPage
