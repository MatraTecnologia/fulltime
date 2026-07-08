import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs"

const SettingsPage = () => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Gerencie seu perfil, conta, segurança e preferências."
      />
      <SettingsTabs />
    </div>
  )
}

export default SettingsPage
