"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { AccountSettings } from "./account-settings"
import { SecuritySettings } from "./security-settings"
import { PreferencesSettings } from "./preferences-settings"
import { NotificationsSettings } from "./notifications-settings"
import { IntegrationsSettings } from "./integrations-settings"

const tabs = [
  { value: "perfil", label: "Perfil" },
  { value: "conta", label: "Conta" },
  { value: "seguranca", label: "Segurança" },
  { value: "preferencias", label: "Preferências" },
  { value: "notificacoes", label: "Notificações" },
  { value: "integracoes", label: "Integrações" },
]

export const SettingsTabs = () => {
  const [tab, setTab] = useState("perfil")

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
      <TabsList className="w-full max-w-full overflow-x-auto">
        {tabs.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="perfil">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="conta">
        <AccountSettings />
      </TabsContent>
      <TabsContent value="seguranca">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="preferencias">
        <PreferencesSettings />
      </TabsContent>
      <TabsContent value="notificacoes">
        <NotificationsSettings />
      </TabsContent>
      <TabsContent value="integracoes">
        <IntegrationsSettings />
      </TabsContent>
    </Tabs>
  )
}
