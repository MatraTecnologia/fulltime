"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { games } from "@/lib/games";
import { useLearning } from "./learning-provider";
import { GameCard } from "./game-catalog";
import { GameArt } from "./illustrations";
import { LearningMascot } from "./learning-mascot";
import { AdventureTrail } from "./adventure-trail";
import { useOwlPet } from "./use-owl-pet";

export function HomeOverview() {
  const { name, sessions } = useLearning();
  const { pet } = useOwlPet();
  const nextGame =
    games.find((g) => !sessions.some((s) => s.gameId === g.id)) || games[0];
  const suggestions = games.filter((game) => game.id !== nextGame.id).slice(0, 2);
  const stars = sessions.reduce((total, session) => total + session.stars, 0);
  return (
    <>
      <div className="simple-page-heading home-greeting">
        <p>Que bom ter você aqui!</p>
        <h1>Olá, {name} <span aria-hidden="true">👋</span></h1>
        <p>Vamos brincar um pouquinho?</p>
      </div>
      <div className="home-mascot">
        <LearningMascot mascotName={pet.name} message={`Olá, ${name}! Eu sou ${pet.name}. Vamos descobrir coisas novas e colecionar estrelinhas juntos?`}>
          <Button asChild className="mascot-start"><Link href={`/games/${nextGame.id}`}>Vamos brincar <ArrowRight size={17} aria-hidden="true" /></Link></Button>
        </LearningMascot>
      </div>
      <AdventureTrail mascotName={pet.name} />
      <section aria-labelledby="suggested-title" className="suggested-section">
        <Link href={`/games/${nextGame.id}`} className="suggested-game">
          <div className={`suggested-game-art ${nextGame.color}`} aria-hidden="true"><GameArt type={nextGame.icon} /></div>
          <div className="suggested-game-copy">
            <span className="suggested-label">{sessions.length ? "Sua próxima descoberta" : "Um jogo para começar"}</span>
            <h2 id="suggested-title">{nextGame.title}</h2>
            <p>{nextGame.description}</p>
            <span className="suggested-play">Brincar agora <ArrowRight size={20} aria-hidden="true" /></span>
          </div>
        </Link>
        <Button asChild variant="outline" className="all-games-button">
          <Link href="/games">Escolher outro jogo <ArrowRight size={18} /></Link>
        </Button>
      </section>
      <section className="more-games" aria-labelledby="more-games-title">
        <h2 id="more-games-title">Mais brincadeiras</h2>
        <div className="game-grid">{suggestions.map((game) => <GameCard key={game.id} game={game} />)}</div>
      </section>
      <Link href="/conquistas" className="home-progress-link">
        <Star size={21} fill="currentColor" aria-hidden="true" />
        <span>{stars ? `${stars} estrelas conquistadas` : "Cada brincadeira rende estrelas"}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </>
  );
}

export function AchievementsOverview() {
  const { sessions, name } = useLearning();
  const { pet } = useOwlPet();
  const unique = new Set(sessions.map((s) => s.gameId));
  return (
    <>
      <div className="simple-page-heading">
        <h1>Suas estrelas <span aria-hidden="true">✨</span></h1>
        <p>Cada descoberta conta, {name}.</p>
      </div>
      <LearningMascot mascotName={pet.name} mood={sessions.length ? "celebrate" : "guide"} message={sessions.length ? `Parabéns, ${name}! Cada uma dessas ${sessions.length * 3} estrelinhas conta uma descoberta nossa!` : `Nossa coleção começa com uma brincadeira, ${name}. Vamos conquistar as primeiras estrelinhas?`} />
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
      <div className="simple-page-heading">
        <h1>Ajustes</h1>
        <p>Para quem acompanha a criança.</p>
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
