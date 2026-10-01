import { notFound } from "next/navigation";
import { games } from "@/lib/games";
import { GamePlayer } from "@/components/game-player";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.id }));
}
export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = games.find((g) => g.id === slug);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
