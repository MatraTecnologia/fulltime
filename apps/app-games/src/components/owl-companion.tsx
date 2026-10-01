import Link from "next/link";
import { Owl } from "./illustrations";

export function OwlCompanion() {
  return (
    <Link href="/corujinha" className="owl-companion" aria-label="Visitar e cuidar da minha corujinha">
      <span className="companion-body"><Owl /></span>
      <span className="owl-bubble">Vem cuidar de mim! <span>♡</span><span className="companion-arrow">→</span></span>
    </Link>
  );
}
