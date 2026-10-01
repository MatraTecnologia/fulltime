"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bird, BookOpen, Gamepad2, Home, Settings2, Star, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearning } from "./learning-provider";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/games", label: "Jogos", icon: Gamepad2 },
  { href: "/corujinha", label: "Corujinha", icon: Bird },
  { href: "/conquistas", label: "Estrelas", icon: Star },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, setSettings, storageAvailable } = useLearning();
  const playing = pathname.startsWith("/games/");

  return (
    <div className={cn("app-layout mobile-first", settings.calm && "calm-mode", settings.largeText && "large-text")}>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <div className="main-column">
        <header className="mobile-header">
          <div className="mobile-header-inner">
            {playing ? (
              <Link href="/games" className="header-back"><ArrowLeft size={22} aria-hidden="true" /> Jogos</Link>
            ) : (
              <Link href="/home" className="mobile-brand" aria-label="Full Time Brincar, início">
                <span className="mobile-brand-icon"><BookOpen size={23} aria-hidden="true" /></span>
                <span><strong>Brincar<span>.</span></strong><small>full time</small></span>
              </Link>
            )}
            <div className="mobile-header-actions">
              <Button
                variant="ghost"
                size="icon"
                className="header-icon-button"
                aria-label={settings.sound ? "Desativar voz" : "Ativar voz"}
                aria-pressed={settings.sound}
                onClick={() => {
                  setSettings({ sound: !settings.sound });
                  if (settings.sound && "speechSynthesis" in window) window.speechSynthesis.cancel();
                }}
              >
                {settings.sound ? <Volume2 /> : <VolumeX />}
              </Button>
              <Link href="/responsaveis" className={cn("header-icon-button", pathname === "/responsaveis" && "active")} aria-label="Ajustes para responsáveis" aria-current={pathname === "/responsaveis" ? "page" : undefined}>
                <Settings2 size={22} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>
        {!storageAvailable && (
          <p className="storage-notice" role="status">O navegador não permitiu salvar o progresso. Suas descobertas ficam disponíveis nesta sessão.</p>
        )}
        <main id="conteudo" className="page-content" tabIndex={-1}>{children}</main>
        <footer className="mobile-footer">No seu ritmo, uma descoberta de cada vez.</footer>
      </div>
      <nav className="bottom-navigation" aria-label="Navegação principal">
        <div className="bottom-navigation-inner">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/games" && playing);
            return (
              <Link key={href} href={href} className={cn("bottom-navigation-item", active && "active")} aria-current={active ? "page" : undefined}>
                <span className="bottom-navigation-icon"><Icon size={23} aria-hidden="true" /></span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
