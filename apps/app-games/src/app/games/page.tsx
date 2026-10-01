import type { Metadata } from "next";
import { GameCatalog } from "@/components/game-catalog";
export const metadata: Metadata = { title: "Vamos brincar" };
export default function GamesPage() {
  return <GameCatalog />;
}
