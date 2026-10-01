"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Gamepad2,
  Heart,
  Leaf,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { games } from "@/lib/games";
import { useLearning } from "./learning-provider";
import { GameCard } from "./game-catalog";
import { Owl } from "./illustrations";

export function HomeOverview() {
  const { name, sessions } = useLearning();
  const last = sessions.at(-1);
  const nextGame =
    games.find((g) => !sessions.some((s) => s.gameId === g.id)) || games[0];
  return (
    <>
      <div className="breadcrumb">
        <strong>Meu cantinho</strong>
      </div>
      <section className="catalog-hero home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> QUE BOM TER VOCÊ POR AQUI
          </span>
          <h1>
            Olá, {name}!<br />
            <span>Vamos descobrir algo novo?</span>
          </h1>
          <p>
            Um pouquinho de curiosidade e um montão de possibilidades.
            <br />A próxima aventura começa com você.
          </p>
          <Button asChild className="hero-cta">
            <Link href="/games">
              Escolher uma aventura <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
        <div className="hero-illustration">
          <Owl />
          <span className="owl-bubble">Seu ritmo é especial. ♡</span>
        </div>
      </section>
      <div className="overview-stats">
        <Card>
          <span className="stat-icon yellow">
            <Star fill="currentColor" />
          </span>
          <div>
            <strong>{sessions.length * 3}</strong>
            <span>estrelas conquistadas</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon mint">
            <Gamepad2 />
          </span>
          <div>
            <strong>{new Set(sessions.map((s) => s.gameId)).size} de 8</strong>
            <span>aventuras descobertas</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon lavender">
            <Heart />
          </span>
          <div>
            <strong>No seu ritmo</strong>
            <span>cada tentativa vale a pena</span>
          </div>
        </Card>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            UM PEQUENO PASSO PARA UMA GRANDE DESCOBERTA
          </span>
          <h2>{last ? "Sua próxima aventura" : "Que tal começar por aqui?"}</h2>
        </div>
        <Link href="/games" className="text-link">
          Ver todos os jogos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="home-recommendations">
        <GameCard game={nextGame} />
        <Card className="discovery-note">
          <Leaf size={32} />
          <h3>Aprender também é tentar.</h3>
          <p>
            Você pode repetir um jogo quantas vezes quiser, pedir uma dica ou
            fazer uma pausa. O caminho é seu!
          </p>
          <span>Vamos juntos, uma descoberta de cada vez. ♡</span>
        </Card>
      </div>
    </>
  );
}

export function AchievementsOverview() {
  const { sessions, name } = useLearning();
  const unique = new Set(sessions.map((s) => s.gameId));
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">
          <Trophy size={15} /> CADA PASSO MERECE CARINHO
        </span>
        <h1>
          Suas descobertas, {name} <span>✨</span>
        </h1>
        <p>Olha quanta coisa você está aprendendo!</p>
      </div>
      <Card className="achievement-summary">
        <span className="big-star">⭐</span>
        <div>
          <h2>{sessions.length * 3} estrelas de descobertas</h2>
          <p>
            {sessions.length}{" "}
            {sessions.length === 1
              ? "aventura concluída"
              : "aventuras concluídas"}{" "}
            · {unique.size} jogos explorados
          </p>
          <Progress
            value={(unique.size / games.length) * 100}
            aria-label={`${unique.size} de ${games.length} jogos explorados`}
          />
          <span>
            {unique.size} de {games.length} aventuras descobertas. Uma de cada
            vez!
          </span>
        </div>
      </Card>
      <h2 className="subheading">Seu álbum de aventuras</h2>
      <div className="achievement-grid">
        {games.map((game) => (
          <Card
            key={game.id}
            className={`achievement-card ${unique.has(game.id) ? "earned" : ""}`}
          >
            <span className={`achievement-icon ${game.color}`}>
              {unique.has(game.id) ? (
                <Star fill="currentColor" />
              ) : (
                <Sparkles />
              )}
            </span>
            <h3>{game.title}</h3>
            <p>
              {unique.has(game.id)
                ? "Você fez essa descoberta!"
                : "Uma aventura esperando por você"}
            </p>
            <Button
              asChild
              variant={unique.has(game.id) ? "outline" : "default"}
            >
              <Link href={`/games/${game.id}`}>
                {unique.has(game.id) ? "Brincar de novo" : "Explorar"}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </Card>
        ))}
      </div>
      {sessions.length > 0 && (
        <>
          <h2 className="subheading">Descobertas recentes</h2>
          <div className="recent-sessions">
            {sessions
              .slice(-5)
              .reverse()
              .map((session, index) => (
                <div key={`${session.date}-${index}`}>
                  <span>
                    <Check size={18} />
                    {games.find((g) => g.id === session.gameId)?.title}
                  </span>
                  <time dateTime={session.date}>
                    {new Date(session.date).toLocaleDateString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </time>
                  <span className="session-stars">★★★</span>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
}

export function AdultSettings() {
  const { name, setName, settings, setSettings, sessions, speak } =
    useLearning();
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const options = [
    {
      key: "sound" as const,
      title: "Incentivos por voz",
      text: "Lê as mensagens de incentivo. O botão “Ouvir” continua disponível em cada jogo.",
      icon: Volume2,
    },
    {
      key: "calm" as const,
      title: "Modo tranquilo",
      text: "Reduz movimentos e elementos decorativos para ajudar a concentrar.",
      icon: Leaf,
    },
    {
      key: "largeText" as const,
      title: "Textos maiores",
      text: "Amplia os textos e as opções dos jogos para facilitar a leitura.",
      icon: Sparkles,
    },
  ];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">
          <Heart size={15} /> ACOLHER, DESENVOLVER, INCLUIR
        </span>
        <h1>Um cantinho para quem acompanha</h1>
        <p>Adapte a experiência ao jeito de aprender da criança.</p>
      </div>
      <div className="settings-layout">
        <div>
          <Card className="settings-card">
            <h2>Como vamos chamar você?</h2>
            <p>Use um apelido para deixar as aventuras com a sua cara.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setName(draft ?? name);
                setSaved(true);
              }}
            >
              <label htmlFor="nickname">Apelido do explorador</label>
              <div className="nickname-form">
                <input
                  id="nickname"
                  maxLength={24}
                  value={draft ?? name}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setSaved(false);
                  }}
                />
                <Button type="submit">Salvar</Button>
              </div>
              <p role="status" className="saved-message">
                {saved ? "Apelido salvo com carinho!" : ""}
              </p>
            </form>
          </Card>
          <Card className="settings-card">
            <h2>Uma experiência do seu jeitinho</h2>
            {options.map(({ key, title, text, icon: Icon }) => (
              <div className="setting-row" key={key}>
                <Icon size={22} />
                <div>
                  <label htmlFor={key}>{title}</label>
                  <p id={`${key}-help`}>{text}</p>
                </div>
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={(checked) => {
                    setSettings({ [key]: checked });
                    if (
                      key === "sound" &&
                      !checked &&
                      "speechSynthesis" in window
                    )
                      window.speechSynthesis.cancel();
                  }}
                  aria-describedby={`${key}-help`}
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                speak("Olá! Vamos aprender juntos, no seu ritmo.", true)
              }
            >
              <Volume2 size={17} />
              Experimentar a voz
            </Button>
            <p className="small-note">
              A voz depende do suporte e das vozes em português disponíveis no
              navegador.
            </p>
          </Card>
        </div>
        <div>
          <Card className="settings-card adult-note">
            <span className="gentle-icon">🌱</span>
            <h2>Presença faz a diferença</h2>
            <p>
              Explore junto, leia as instruções e ofereça pausas. Celebre a
              curiosidade e as tentativas, além dos acertos.
            </p>
            <p>
              Os jogos trabalham habilidades de alfabetização, atenção e
              associação. Escolha a atividade de acordo com o momento da
              criança.
            </p>
          </Card>
          <Card className="settings-card">
            <h2>Progresso neste dispositivo</h2>
            <p>
              {sessions.length} atividades concluídas e {sessions.length * 3}{" "}
              estrelas.
            </p>
            <p>
              O apelido, os ajustes e as últimas 100 atividades ficam salvos
              somente neste navegador. Ainda não há sincronização com a conta do
              EAD.
            </p>
            <Button asChild variant="outline">
              <Link href="/conquistas">
                Ver as descobertas <ArrowRight size={17} />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
