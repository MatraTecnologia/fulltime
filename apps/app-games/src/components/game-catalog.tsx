"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categories, games, type Game } from "@/lib/games";
import { cn } from "@/lib/utils";
import { GameArt } from "./illustrations";
import { useLearning } from "./learning-provider";

export function GameCard({ game }: { game: Game }) {
  const { sessions } = useLearning();
  const completed = sessions.some((s) => s.gameId === game.id);
  return (
    <Card className="game-card">
      <Link href={`/games/${game.id}`} className="game-card-link">
        <div className={cn("game-card-image", game.color)}>
          <GameArt type={game.icon} />
          {completed && (
            <span className="completed-mark" aria-label="Já concluído">
              <Star size={18} fill="currentColor" />
            </span>
          )}
        </div>
        <div className="game-card-body">
          <h3>{game.title}</h3>
          <p>{game.description}</p>
          <div className="game-card-footer">
            <span>
              Brincar
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
      <div className="simple-page-heading">
        <h1>Vamos brincar?</h1>
        <p>Escolha um jogo e comece.</p>
      </div>
      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <h2 id="catalog-title" className="sr-only">Escolha um jogo</h2>
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
          {["Todos os jogos", ...categories].map((item) => (
            <Button
              key={item}
              variant={category === item ? "default" : "ghost"}
              className={cn("filter-button", category === item && "selected")}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item === "Todos os jogos" ? "Todos" : item}
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
    </>
  );
}
