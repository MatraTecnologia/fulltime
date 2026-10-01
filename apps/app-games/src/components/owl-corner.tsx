"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Apple, ArrowRight, Check, Gamepad2, Heart, Moon, Paintbrush, Pencil, Sparkles, Star, Sun, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PetAction, PetRoom } from "@/lib/owl-pet";
import { Owl } from "./illustrations";
import { useLearning } from "./learning-provider";
import { useOwlPet } from "./use-owl-pet";

const rooms: { id: PetRoom; label: string }[] = [
  { id: "lavender", label: "Lavanda" },
  { id: "mint", label: "Jardim" },
  { id: "peach", label: "Pêssego" },
];
const starSpots = [[18, 43], [77, 25], [28, 19], [80, 58], [50, 28]];
const reactions: Record<PetAction, string> = {
  pet: "Huuu! Seu carinho faz cócegas! ♡",
  feed: "Nhac, nhac… uma maçã deliciosa!",
  bathe: "Plim! Limpinha e cheirosa!",
  sleep: "Uma sonequinha… fica aqui comigo?",
  play: "Pegamos todas! Adorei brincar com você!",
};

export function OwlCorner() {
  const { pet, care, customize, storageAvailable } = useOwlPet();
  const { speak } = useLearning();
  const [reaction, setReaction] = useState<PetAction | null>(null);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [caught, setCaught] = useState(0);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const level = Math.floor(pet.careCount / 8) + 1;
  const friendship = pet.careCount % 8;
  const busy = reaction !== null;
  const greeting = pet.sleeping ? "Zzz… sonhando com novas aventuras." : pet.food < 45
    ? "Que tal um lanchinho antes de brincar?" : pet.energy < 45
      ? "Estou com soninho. Vamos descansar?" : "Oi! Que bom que você veio me visitar! ♡";

  useEffect(() => {
    if (!reaction) return;
    const timeout = window.setTimeout(() => setReaction(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [reaction]);

  function interact(action: PetAction) {
    if (busy || (pet.sleeping && action !== "sleep")) return;
    care(action);
    setReaction(action);
    const text = action === "sleep" && pet.sleeping ? "Bom dia! Já estava com saudade!" : reactions[action];
    setMessage(text);
    speak(action === "sleep" && pet.sleeping ? "pet-wake" : `pet-${action}`);
  }

  function catchStar() {
    if (!playing) return;
    const next = caught + 1;
    setCaught(next);
    if (next === starSpots.length) {
      setPlaying(false);
      interact("play");
    }
  }

  const needs = [
    { label: "Barriguinha", value: pet.food, icon: Apple, color: "food" },
    { label: "Alegria", value: pet.joy, icon: Heart, color: "joy" },
    { label: "Energia", value: pet.energy, icon: Moon, color: "energy" },
    { label: "Banho", value: pet.clean, icon: Droplets, color: "clean" },
  ];

  return (
    <>
      <div className="breadcrumb"><Link href="/home">Meu cantinho</Link><span>/</span><strong>Minha corujinha</strong></div>
      <div className="pet-heading">
        <div>
          <span className="eyebrow"><Heart size={15} /> UMA AMIZADE PARA CUIDAR</span>
          <h1>O cantinho de <span>{pet.name}</span> <span aria-hidden="true">♡</span></h1>
          <p>Um carinho, uma brincadeira e um montão de companhia.</p>
        </div>
        <span className="pet-level"><Sparkles size={18} /> Amizade nível {level}</span>
      </div>

      <div className="pet-layout">
        <section className="pet-house" aria-label={`Quarto de ${pet.name}`}>
          <div className="pet-needs">
            {needs.map(({ label, value, icon: Icon, color }) => (
              <div className={`pet-need need-${color}`} key={label}>
                <div><Icon size={16} /><span>{label}</span><strong>{Math.round(value)}%</strong></div>
                <div className="pet-meter" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className={cn("pet-room", `room-${pet.room}`, pet.sleeping && "room-night", playing && "room-playing")}>
            <div className="pet-room-label"><span className="pet-online-dot" />{pet.sleeping ? "Hora da soneca" : playing ? "Caça às estrelinhas" : "Lar, doce lar"}</div>
            <div className="pet-window" aria-hidden="true"><span className="window-sky">{pet.sleeping ? <Moon size={28} fill="currentColor" /> : <Sun size={32} />}</span><span className="window-cloud" /></div>
            <div className="pet-wall-art" aria-hidden="true"><Heart size={24} /></div>
            <div className="pet-shelf" aria-hidden="true"><span>📚</span><span>🌱</span></div>
            <div className="pet-rug" aria-hidden="true" />
            <div className="pet-plant" aria-hidden="true">🪴</div>

            <p className="pet-speech" role="status" aria-live="polite" aria-atomic="true">{message || greeting}</p>
            <button
              type="button"
              className={cn("pet-character", reaction && `pet-react-${reaction}`)}
              aria-label={`Fazer carinho em ${pet.name}`}
              disabled={pet.sleeping || playing || busy}
              onClick={() => interact("pet")}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--look-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 9}px`);
                event.currentTarget.style.setProperty("--look-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 6}px`);
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--look-x", "0px");
                event.currentTarget.style.setProperty("--look-y", "0px");
              }}
            >
              <span className="pet-owl-body"><Owl sleeping={pet.sleeping} happy={reaction === "pet" || reaction === "play"} /></span>
              {pet.sleeping && <span className="pet-zzz" aria-hidden="true">z z Z</span>}
              {reaction === "feed" && <span className="pet-snack" aria-hidden="true">🍎</span>}
              {(reaction === "pet" || reaction === "play") && <span className="pet-hearts" aria-hidden="true"><span>♡</span><span>♡</span><span>♡</span></span>}
              {reaction === "bathe" && <span className="pet-bubbles" aria-hidden="true"><i /><i /><i /><i /><i /></span>}
            </button>
            {playing && (
              <button type="button" className="pet-catch-star" style={{ left: `${starSpots[caught][0]}%`, top: `${starSpots[caught][1]}%` }} onClick={catchStar} aria-label={`Pegar estrela ${caught + 1} de ${starSpots.length}`}>
                <Star size={38} fill="currentColor" />
              </button>
            )}
            <div className="pet-room-hint">
              {playing ? <><span role="status">{caught} de {starSpots.length} estrelas · toque na estrelinha!</span><button type="button" onClick={() => { setPlaying(false); setMessage("Podemos brincar de novo quando você quiser! ♡"); }}>Parar brincadeira</button></>
                : <span>{pet.sleeping ? "Ela recupera energia enquanto descansa." : "Toque na corujinha para fazer carinho ♡"}</span>}
            </div>
          </div>

          <div className="pet-actions" aria-label="Cuidar da corujinha">
            <button type="button" disabled={pet.sleeping || playing || busy} onClick={() => interact("feed")}><span className="action-food"><Apple size={24} /></span><strong>Lanchinho</strong></button>
            <button type="button" disabled={pet.sleeping || playing || busy} onClick={() => interact("bathe")}><span className="action-bath"><Droplets size={24} /></span><strong>Banho</strong></button>
            <button type="button" disabled={playing || busy} aria-pressed={pet.sleeping} onClick={() => interact("sleep")}><span className="action-sleep">{pet.sleeping ? <Sun size={24} /> : <Moon size={24} />}</span><strong>{pet.sleeping ? "Acordar" : "Sonequinha"}</strong></button>
            <button type="button" disabled={pet.sleeping || playing || busy} onClick={() => { setCaught(0); setPlaying(true); setMessage("Vamos pegar 5 estrelinhas? Toque nelas!"); }}><span className="action-play"><Gamepad2 size={24} /></span><strong>Brincar</strong></button>
          </div>
        </section>

        <aside className="pet-sidebar">
          <section className="pet-panel pet-friendship">
            <span className="pet-panel-icon"><Heart size={23} /></span>
            <h2>Uma dupla e tanto!</h2>
            <p>Cada momento juntos faz a amizade crescer.</p>
            <div className="friendship-label"><strong>Nível {level}</strong><span>{friendship} / 8 carinhos</span></div>
            <div className="pet-meter" role="progressbar" aria-label="Amizade para o próximo nível" aria-valuenow={friendship} aria-valuemin={0} aria-valuemax={8}><span style={{ width: `${friendship / 8 * 100}%` }} /></div>
            <span className="pet-small-note">Mais {8 - friendship} momentos para o próximo nível ♡</span>
          </section>

          <section className="pet-panel">
            <h2><Paintbrush size={19} /> Do seu jeitinho</h2>
            <p>Escolha uma cor para o quarto.</p>
            <div className="pet-room-options" aria-label="Cor do quarto">
              {rooms.map((room) => <button type="button" key={room.id} aria-pressed={pet.room === room.id} onClick={() => customize({ room: room.id })}><span className={`room-swatch room-${room.id}`}>{pet.room === room.id && <Check size={18} />}</span>{room.label}</button>)}
            </div>
            <div className="pet-name-setting">
              {renaming ? <form onSubmit={(event) => { event.preventDefault(); customize({ name: draft.trim().slice(0, 20) || pet.name }); setRenaming(false); }}>
                <label htmlFor="owl-name">Nome da sua corujinha</label>
                <input id="owl-name" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={20} autoFocus />
                <div><Button type="submit" size="sm">Salvar nome</Button><Button type="button" size="sm" variant="ghost" onClick={() => setRenaming(false)}>Cancelar</Button></div>
              </form> : <button type="button" className="pet-rename" onClick={() => { setDraft(pet.name); setRenaming(true); }}><Pencil size={16} /> Mudar o nome de {pet.name}</button>}
            </div>
          </section>

          <section className="pet-panel pet-tip">
            <Sparkles size={23} />
            <h2>A companhia continua</h2>
            <p>{pet.name} adora suas visitas. Cuide dela e depois explore uma nova aventura!</p>
            <Link href="/games">Vamos aprender <ArrowRight size={16} /></Link>
          </section>
          <p className="pet-save-note" role="status">{storageAvailable ? "Seu cantinho fica salvo neste navegador. ♡" : "O navegador não permitiu salvar. Os cuidados ficam disponíveis nesta sessão."}</p>
        </aside>
      </div>
    </>
  );
}
