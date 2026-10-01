import type { Metadata } from "next";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "./globals.css";
import { LearningProvider } from "@/components/learning-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Full Time Brincar · Aprender no seu ritmo",
    template: "%s · Full Time Brincar",
  },
  description:
    "Um mundo de descobertas com jogos educativos de letras, sílabas, palavras e emoções. Cada criança aprende no seu ritmo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <LearningProvider>
          <AppShell>{children}</AppShell>
        </LearningProvider>
      </body>
    </html>
  );
}
