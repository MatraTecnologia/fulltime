"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { games } from "@/lib/games";
import { cn } from "@/lib/utils";
import { useLearning } from "./learning-provider";
import { GameArt } from "./illustrations";

export function AdventureTrail({ mascotName }: { mascotName: string }) {
  const { sessions } = useLearning();
  const completed = new Set(sessions.map((session) => session.gameId));
  const next = games.find((game) => !completed.has(game.id));
  return (
    <section className="adventure-trail" aria-labelledby="trail-title">
      <div className="trail-heading">
        <div><p>Um caminho de descobertas</p><h2 id="trail-title">Minha aventura com {mascotName}</h2></div>
        <span className="trail-count"><Star size={16} aria-hidden="true" /> {completed.size}/{games.length}</span>
      </div>
      <p className="trail-description">Escolha uma parada para brincar. Você pode explorar na ordem que quiser!</p>
      <ol className="trail-stops">
        {games.map((game, index) => {
          const done = completed.has(game.id);
          const suggested = game.id === next?.id;
          return (
            <li key={game.id} className={cn("trail-stop", done && "trail-done", suggested && "trail-next")}>
              <Link href={`/games/${game.id}`} className="trail-link" aria-label={`${game.title}. ${done ? "Concluído, 3 estrelas. Brincar de novo" : suggested ? "Próxima descoberta sugerida" : "Explorar"}`}>
                <span className="trail-number" aria-hidden="true">{done ? <Check size={18} /> : index + 1}</span>
                <span className={`trail-art ${game.color}`}><GameArt type={game.icon} /></span>
                <span className="trail-title">{game.title}</span>
                <span className="trail-caption">{done ? <><span aria-hidden="true">★ ★ ★</span> Consegui!</> : suggested ? "Vamos juntos?" : "Vamos explorar"}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      {completed.size === games.length && <p className="trail-finished">Você explorou a trilha inteira! Que tal brincar de novo com {mascotName}?</p>}
    </section>
  );
}
