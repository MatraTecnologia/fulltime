import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="big-star">🌱</span>
      <h1>Essa aventura ainda não está aqui</h1>
      <p>Vamos encontrar um jogo para descobrir juntos?</p>
      <Button asChild>
        <Link href="/games">Explorar os jogos</Link>
      </Button>
    </div>
  );
}
