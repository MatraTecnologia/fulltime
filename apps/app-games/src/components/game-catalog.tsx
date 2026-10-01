"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  Gamepad2,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { categories, games, type Game } from "@/lib/games";
import { cn } from "@/lib/utils";
import { GameArt, Owl } from "./illustrations";
import { useLearning } from "./learning-provider";

export function GameCard({ game }: { game: Game }) {
  const { sessions } = useLearning();
  const completed = sessions.some((s) => s.gameId === game.id);
  return (
    <Card className="game-card">
      <Link href={`/games/${game.id}`} className="game-card-link">
        <div className={cn("game-card-image", game.color)}>
          <Badge className="game-tag" variant="secondary">
            {game.tag}
          </Badge>
          <GameArt type={game.icon} />
          {completed && (
            <span className="completed-mark" aria-label="Já concluído">
              <Star size={18} fill="currentColor" />
            </span>
          )}
        </div>
        <div className="game-card-body">
          <span className="game-category">{game.skill}</span>
          <h3>{game.title}</h3>
          <p>{game.description}</p>
          <div className="game-card-footer">
            <span>
              <Clock3 size={14} />
              {game.duration}
              <span className="time-note"> · sem pressa</span>
            </span>
            <span className="play-circle">
              <ArrowRight size={19} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function GameCatalog() {
  const [category, setCategory] = useState("Todos os jogos");
  const [query, setQuery] = useState("");
  const filtered = games.filter(
    (g) =>
      (category === "Todos os jogos" || g.category === category) &&
      `${g.title} ${g.skill}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(
          query
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        ),
  );
  return (
    <>
      <div className="breadcrumb">
        <span>Meu cantinho</span>
        <span>/</span>
        <strong>Vamos brincar</strong>
      </div>
      <section className="catalog-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> APRENDER PODE SER UMA AVENTURA
          </span>
          <h1>
            Vamos brincar
            <br />e <span>descobrir juntos?</span>
          </h1>
          <p>
            Um mundo de jogos para aprender no seu ritmo.
            <br className="desktop-break" /> Escolha uma aventura. Cada
            tentativa é uma conquista!
          </p>
          <div className="hero-chips">
            <span>
              <Gamepad2 size={16} />8 aventuras para explorar
            </span>
            <span>
              <HeartIcon />
              Do seu jeitinho
            </span>
          </div>
        </div>
        <div className="hero-illustration">
          <span className="floating-letter floating-a">A</span>
          <span className="floating-letter floating-b">B</span>
          <Owl />
          <span className="owl-bubble">
            Oi! Vamos aprender? <span>♡</span>
          </span>
          <span className="hero-doodle doodle-one">✦</span>
          <span className="hero-doodle doodle-two">✧</span>
        </div>
      </section>
      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PEQUENAS DESCOBERTAS, TODOS OS DIAS</span>
            <h2 id="catalog-title">
              Qual vai ser a aventura de hoje? <span>✨</span>
            </h2>
          </div>
          <label className="search-field">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Encontre um jogo"
              aria-label="Buscar jogos"
            />
          </label>
        </div>
        <div className="filter-row" aria-label="Filtrar jogos">
          {["Todos os jogos", ...categories].map((item, i) => (
            <Button
              key={item}
              variant={category === item ? "default" : "ghost"}
              className={cn("filter-button", category === item && "selected")}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {i === 0 && <Gamepad2 size={16} />}
              {item}
              {i === 0 && <span>{games.length}</span>}
            </Button>
          ))}
        </div>
        <div className="game-grid">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Search />
            <h3>Nenhum jogo por aqui ainda</h3>
            <p>Tente outra palavra ou explore todas as aventuras.</p>
            <Button
              onClick={() => {
                setQuery("");
                setCategory("Todos os jogos");
              }}
            >
              Ver todos os jogos
            </Button>
          </div>
        )}
      </section>
      <div className="gentle-banner">
        <span className="gentle-icon">🌈</span>
        <div>
          <strong>Aqui, aprender é para todo mundo.</strong>
          <p>
            Sem tempo marcado, sem comparação. Com carinho, curiosidade e muitas
            possibilidades.
          </p>
        </div>
        <Link href="/responsaveis">
          Conheça os ajustes <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}

function HeartIcon() {
  return (
    <span aria-hidden="true" className="tiny-heart">
      ♡
    </span>
  );
}
