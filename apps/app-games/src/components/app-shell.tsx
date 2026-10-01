"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Gamepad2,
  Heart,
  Home,
  Leaf,
  Settings2,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearning } from "./learning-provider";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/home", label: "Meu cantinho", icon: Home },
  { href: "/games", label: "Vamos brincar", icon: Gamepad2 },
  { href: "/conquistas", label: "Minhas conquistas", icon: Trophy },
  { href: "/responsaveis", label: "Para responsáveis", icon: Heart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { name, settings, setSettings, sessions, storageAvailable } =
    useLearning();
  const total = sessions.reduce((sum, session) => sum + session.stars, 0);
  return (
    <div
      className={cn(
        "app-layout",
        settings.calm && "calm-mode",
        settings.largeText && "large-text",
      )}
    >
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link
          href="/home"
          className="brand"
          aria-label="Full Time Brincar, início"
        >
          <span className="brand-symbol">
            <BookOpen size={25} />
            <Sparkles size={12} />
          </span>
          <span>
            <strong>
              full time<span className="brand-dot">.</span>
            </strong>
            <span className="brand-caption">brincar & aprender</span>
          </span>
        </Link>
        <div className="sidebar-divider" />
        <p className="nav-label">UM MUNDO DE DESCOBERTAS</p>
        <nav aria-label="Navegação principal">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-item",
                (pathname === href ||
                  (href === "/games" && pathname.startsWith("/games/"))) &&
                  "active",
              )}
            >
              <Icon size={21} />
              <span>{label}</span>
              {href === "/games" && <span className="nav-count">8</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-flower">🌱</span>
          <strong>Cada descoberta conta.</strong>
          <p>
            Pequenos passos.
            <br />
            Grandes possibilidades.
          </p>
          <span className="note-hearts">♡ &nbsp; ♡ &nbsp; ♡</span>
        </div>
        <div className="sidebar-bottom">
          <Link href="/responsaveis" className="nav-item">
            <Settings2 size={19} />
            Ajustes de acessibilidade
          </Link>
          <span>
            <Heart size={13} /> Feito para incluir
          </span>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-welcome">
            <Leaf size={18} />
            <span>Aprender, do seu jeitinho.</span>
          </div>
          <div className="topbar-actions">
            <span className="stars-pill">
              <Star size={17} fill="currentColor" />
              {total}
              <span>estrelas</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="sound-button"
              aria-label={settings.sound ? "Desativar voz" : "Ativar voz"}
              aria-pressed={settings.sound}
              onClick={() => {
                setSettings({ sound: !settings.sound });
                if (settings.sound && "speechSynthesis" in window)
                  window.speechSynthesis.cancel();
              }}
            >
              {settings.sound ? <Volume2 /> : <VolumeX />}
            </Button>
            <Link className="profile-pill" href="/responsaveis">
              <span className="profile-avatar">😊</span>
              <span>{name}</span>
            </Link>
          </div>
        </header>
        {!storageAvailable && (
          <p className="storage-notice" role="status">
            O navegador não permitiu salvar o progresso. Suas descobertas ficam
            disponíveis nesta sessão.
          </p>
        )}
        <main id="conteudo" className="page-content">
          {children}
        </main>
        <footer className="site-footer">
          <span>
            <Heart size={14} /> Cada criança tem seu tempo. Aqui, todos os
            passos são especiais.
          </span>
          <strong>Full Time Brincar</strong>
        </footer>
      </div>
    </div>
  );
}
