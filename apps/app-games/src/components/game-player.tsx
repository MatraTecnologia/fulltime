"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowRight,
  Check,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Star,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { games, type Game } from "@/lib/games";
import {
  letterPaths,
  selectedWord,
  traceCoverage,
  type Point,
} from "@/lib/game-logic";
import { cn } from "@/lib/utils";
import { useLearning } from "./learning-provider";
import { LearningMascot, RewardStars } from "./learning-mascot";
import { useOwlPet } from "./use-owl-pet";

type RoundProps = {
  round: number;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
};
const letterRounds = [
  { target: "A", letters: "ABOCAMLAE" },
  { target: "E", letters: "EBOAEMLEE" },
  { target: "O", letters: "OBOAMOLOE" },
];
const syllableRounds = [
  {
    word: "BOLA",
    emoji: "⚽",
    answer: ["BO", "LA"],
    options: ["LA", "CA", "BO", "TO"],
  },
  {
    word: "GATO",
    emoji: "🐱",
    answer: ["GA", "TO"],
    options: ["PA", "TO", "GA", "LO"],
  },
  {
    word: "CASA",
    emoji: "🏠",
    answer: ["CA", "SA"],
    options: ["SA", "BA", "LA", "CA"],
  },
];
const emojiRounds = [
  { emoji: "🦁", answer: "LEÃO", options: ["GATO", "LEÃO", "PATO"] },
  { emoji: "🍎", answer: "MAÇÃ", options: ["BANANA", "UVA", "MAÇÃ"] },
  {
    emoji: "🚲",
    answer: "BICICLETA",
    options: ["BICICLETA", "CARRO", "AVIÃO"],
  },
];
const numberRounds = [
  { emoji: "🍓", count: 3, options: [2, 3, 4] },
  { emoji: "⭐", count: 4, options: [4, 2, 5] },
  { emoji: "🦋", count: 2, options: [3, 1, 2] },
];
const colorRounds = [
  {
    color: "#c63846",
    answer: "VERMELHO",
    options: ["AZUL", "VERMELHO", "VERDE"],
  },
  { color: "#2877ba", answer: "AZUL", options: ["AMARELO", "VERDE", "AZUL"] },
  { color: "#398451", answer: "VERDE", options: ["VERDE", "VERMELHO", "AZUL"] },
];
const wordRounds = [
  {
    word: "SOL",
    emoji: "☀️",
    grid: "SOLARGATOMLUAIPBEMNOFCTUV",
    positions: [0, 1, 2],
  },
  {
    word: "GATO",
    emoji: "🐱",
    grid: "ABCDMGATOPRSELITUVABONHAC",
    positions: [5, 6, 7, 8],
  },
  {
    word: "LUA",
    emoji: "🌙",
    grid: "ABCDEMFGHOLUAIPRSTUVONHAC",
    positions: [10, 11, 12],
  },
];

function roundInstruction(game: Game, round: number) {
  switch (game.id) {
    case "caca-letras":
      return `Encontre todas as letras ${letterRounds[round].target}. Toque em cada uma delas.`;
    case "junta-silabas":
      return `Vamos formar a palavra ${syllableRounds[round].word}. Toque nas sílabas na ordem certa.`;
    case "caca-palavras":
      return `Encontre ${wordRounds[round].word}. Toque nas letras vizinhas na ordem da palavra.`;
    case "desenhe-a-letra":
      return `Siga o caminho da letra ${letterPaths[round].letter} com o dedo ou o mouse. Você também pode usar a atividade por teclado.`;
    case "quiz-emojis":
      return "Observe a imagem. Qual palavra combina com ela?";
    case "memoria":
      return "Toque em duas cartas e encontre os três pares de amigos.";
    case "numeros":
      return "Conte os objetos. Quantos você encontrou?";
    case "cores":
      return "Observe a cor. Qual é o nome dela?";
  }
}
function roundHint(game: Game, round: number) {
  switch (game.id) {
    case "caca-letras":
      return `Procure este formato: ${letterRounds[round].target}. Há ${letterRounds[round].letters.split("").filter((l) => l === letterRounds[round].target).length} letras iguais.`;
    case "junta-silabas":
      return `A primeira sílaba é ${syllableRounds[round].answer[0]}. Fale a palavra devagar.`;
    case "caca-palavras":
      return `Comece pela linha ${Math.floor(wordRounds[round].positions[0] / 5) + 1}, coluna 1, e siga para a direita.`;
    case "desenhe-a-letra":
      return "Percorra todos os caminhos pontilhados. Você pode levantar o dedo e continuar outro traço.";
    case "quiz-emojis":
      return `A palavra começa com ${emojiRounds[round].answer[0]}.`;
    case "memoria":
      return "Observe onde cada amigo está. Se as cartas forem diferentes, tente outro par.";
    case "numeros":
      return "Aponte para cada objeto e conte: um, dois, três...";
    case "cores":
      return `A cor começa com a letra ${colorRounds[round].answer[0]}.`;
  }
}

export function GamePlayer({ game }: { game: Game }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <GameSession
      key={`${game.id}-${attempt}`}
      game={game}
      restart={() => setAttempt((a) => a + 1)}
    />
  );
}

function GameSession({ game, restart }: { game: Game; restart: () => void }) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "retry" | null>(null);
  const [hint, setHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const completed = useRef(false);
  const { completeGame, speak, name, sessions } = useLearning();
  const { pet } = useOwlPet();
  const totalRounds = game.id === "memoria" ? 1 : 3;
  const instruction = roundInstruction(game, round);
  const nextAdventure = games.find((candidate) => candidate.id !== game.id && !sessions.some((session) => session.gameId === candidate.id))
    || games[(games.findIndex((candidate) => candidate.id === game.id) + 1) % games.length];
  const encouragement = feedback === "correct"
    ? [`Muito bem, ${name}! Você fez uma nova descoberta!`, `Que legal, ${name}! Mais um passo na nossa aventura!`, `Você conseguiu, ${name}! Vamos guardar suas estrelinhas?`][round]
    : feedback === "retry"
      ? `Vamos tentar de novo, ${name}? Estou aqui com você. Você pode pedir uma dica!`
      : hint
        ? `Vamos descobrir juntos? ${roundHint(game, round)}`
        : `Estou com você, ${name}! ${round === 0 ? "Explore com calma. Você consegue!" : "Vamos para a próxima descoberta!"}`;
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  function answer(correct: boolean) {
    setFeedback(correct ? "correct" : "retry");
    speak(
      correct
        ? `Muito bem, ${name}! Você fez uma nova descoberta!`
        : `Vamos tentar de novo, ${name}? Estou aqui com você. Você pode pedir uma dica.`,
    );
  }
  function next() {
    if (round + 1 === totalRounds) {
      if (!completed.current) {
        completed.current = true;
        completeGame(game.id);
      }
      setFinished(true);
      speak(`Parabéns, ${name}! Você conseguiu! Três estrelas para a nossa aventura!`);
    } else {
      setRound((r) => r + 1);
      setFeedback(null);
      setHint(false);
    }
  }
  if (finished)
    return (
      <div className="completion-screen">
        <LearningMascot mascotName={pet.name} mood="celebrate" message={`Parabéns, ${name}! Adorei brincar com você. Olha as estrelinhas que você conquistou!`} />
        <RewardStars />
        <h1>Parabéns, {name}!</h1>
        <p>
          Você concluiu {game.title.toLowerCase()} e ganhou 3 estrelas.
          <br />
          Cada pequeno passo é uma grande conquista.
        </p>
        <div>
          <Button onClick={restart}>
            <RotateCcw size={17} />
            Brincar de novo
          </Button>
          <Button asChild variant="outline">
            <Link href={`/games/${nextAdventure.id}`}>
              Continuar com {pet.name} <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
        <Link href="/conquistas" className="text-link">
          Ver minhas conquistas
        </Link>
        <Link href="/home" className="text-link">Voltar para minha trilha</Link>
      </div>
    );
  const props: RoundProps = {
    round,
    onAnswer: answer,
    disabled: feedback === "correct" || paused,
  };
  return (
    <>
      <div className="player-heading">
        <div>
          <h1>{game.title}</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setPaused(true);
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
          }}
        >
          <Pause size={16} />
          Pausar
        </Button>
      </div>
      <div className="round-progress">
        <Progress
          value={(round / totalRounds) * 100}
          aria-label={`${round} de ${totalRounds} etapas concluídas`}
        />
        <span>
          Etapa {round + 1} de {totalRounds}
        </span>
        <span>
          <Star size={16} /> Sem tempo marcado
        </span>
      </div>
      <Card className="playground">
        <div className="instruction-row">
          <h2>{instruction}</h2>
          <Button
            variant="outline"
            onClick={() => speak(instruction, true)}
            aria-label="Ouvir instrução"
          >
            <Volume2 size={19} />
            <span>Ouvir</span>
          </Button>
        </div>
        <div key={round} className="round-content">
          {game.id === "caca-letras" && <LetterHunt {...props} />}
          {game.id === "junta-silabas" && <Syllables {...props} />}
          {game.id === "caca-palavras" && <WordSearch {...props} />}
          {game.id === "desenhe-a-letra" && <TraceLetter {...props} />}
          {game.id === "memoria" && <MemoryGame {...props} />}
          {["quiz-emojis", "numeros", "cores"].includes(game.id) && (
            <ChoiceGame {...props} game={game} />
          )}
        </div>
        <div className={cn("feedback mascot-feedback", feedback === "correct" && "positive")}>
          <LearningMascot key={`${round}-${feedback}`} mascotName={pet.name} mood={feedback === "correct" ? "celebrate" : feedback === "retry" ? "encourage" : "guide"} message={encouragement} />
        </div>
        <div className="player-controls">
          <Button
            variant="ghost"
            onClick={() => setHint((h) => !h)}
            aria-expanded={hint}
          >
            <Lightbulb size={18} />
            {hint ? "Fechar dica" : "Dica"}
          </Button>
          {feedback === "correct" && (
            <Button onClick={next}>
              {round + 1 === totalRounds
                ? "Concluir"
                : "Próxima"}
              <ArrowRight size={18} />
            </Button>
          )}
        </div>
        {hint && <p className="hint-box">💡 Dica de {pet.name}: {roundHint(game, round)}</p>}
      </Card>
      <p className="player-note">
        Você pode fazer uma pausa, pedir ajuda e tentar quantas vezes quiser. ♡
      </p>
      <Dialog open={paused} onOpenChange={setPaused}>
        <DialogContent className="pause-dialog">
          <DialogHeader>
            <DialogTitle>Uma pausa também faz bem 🌱</DialogTitle>
            <DialogDescription>
              Respire, estique o corpo ou tome uma água. Sua aventura fica
              esperando por você.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setPaused(false)}>
            <Play size={17} />
            Continuar a aventura
          </Button>
          <Button asChild variant="outline">
            <Link href="/games">Voltar para os jogos</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LetterHunt({ round, onAnswer, disabled }: RoundProps) {
  const [found, setFound] = useState<number[]>([]);
  const { target, letters } = letterRounds[round];
  const count = letters.split("").filter((l) => l === target).length;
  return (
    <>
      <span className="target-letter">{target}</span>
      <p className="round-caption">
        Encontre {count} letras {target} · {found.length} encontradas
      </p>
      <div className="letter-grid">
        {letters.split("").map((letter, i) => (
          <Button
            key={i}
            variant="outline"
            className={cn("letter-tile", found.includes(i) && "found")}
            disabled={disabled || found.includes(i)}
            aria-label={`Letra ${letter}, posição ${i + 1}${found.includes(i) ? ", encontrada" : ""}`}
            onClick={() => {
              if (letter !== target) {
                onAnswer(false);
                return;
              }
              const next = [...found, i];
              setFound(next);
              if (next.length === count) onAnswer(true);
            }}
          >
            {letter}
            {found.includes(i) && <Check size={15} />}
          </Button>
        ))}
      </div>
    </>
  );
}

function Syllables({ round, onAnswer, disabled }: RoundProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const data = syllableRounds[round];
  return (
    <>
      <div className="question-emoji" aria-hidden="true">
        {data.emoji}
      </div>
      <span className="question-word">{data.word}</span>
      <div className="syllable-slots" aria-label="Sílabas escolhidas">
        {[0, 1].map((i) => (
          <span key={i}>
            {selected[i] !== undefined ? data.options[selected[i]] : "?"}
          </span>
        ))}
      </div>
      <div className="answer-options">
        {data.options.map((option, i) => (
          <Button
            key={i}
            variant="outline"
            className="answer-tile"
            disabled={disabled || selected.includes(i) || selected.length === 2}
            onClick={() => {
              const next = [...selected, i];
              setSelected(next);
              if (next.length === 2)
                onAnswer(
                  next.map((index) => data.options[index]).join("") ===
                    data.word,
                );
            }}
          >
            {option}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => setSelected([])}
      >
        <RotateCcw size={16} />
        Escolher de novo
      </Button>
    </>
  );
}

function ChoiceGame({
  game,
  round,
  onAnswer,
  disabled,
}: RoundProps & { game: Game }) {
  const data =
    game.id === "quiz-emojis"
      ? emojiRounds[round]
      : game.id === "numeros"
        ? numberRounds[round]
        : colorRounds[round];
  const answer = "count" in data ? data.count : data.answer;
  return (
    <>
      {"color" in data ? (
        <span
          className="color-question"
          style={{ backgroundColor: data.color }}
          aria-label="Cor para identificar"
        />
      ) : "count" in data ? (
        <div
          className="counting-objects"
          aria-label={`${data.count} objetos para contar`}
        >
          {Array.from({ length: data.count }, (_, i) => (
            <span key={i} aria-hidden="true">
              {data.emoji}
            </span>
          ))}
        </div>
      ) : (
        <div
          className="question-emoji"
          role="img"
          aria-label="Imagem para associar a uma palavra"
        >
          {data.emoji}
        </div>
      )}
      <div className="answer-options">
        {data.options.map((option) => (
          <Button
            variant="outline"
            key={option}
            className="answer-tile word-answer"
            disabled={disabled}
            onClick={() => onAnswer(option === answer)}
          >
            {option}
          </Button>
        ))}
      </div>
    </>
  );
}

function WordSearch({ round, onAnswer, disabled }: RoundProps) {
  const [selection, setSelection] = useState<number[]>([]);
  const data = wordRounds[round];
  const grid = data.grid.split("").slice(0, 25);
  return (
    <>
      <div className="word-search-target">
        <span aria-hidden="true">{data.emoji}</span>
        <strong>{data.word}</strong>
      </div>
      <p className="round-caption">
        Toque nas letras, uma após a outra, e confira a palavra.
      </p>
      <div className="word-grid">
        {grid.map((letter, i) => (
          <Button
            variant="outline"
            className={cn(
              "letter-tile",
              selection.includes(i) && "selected-letter",
            )}
            key={i}
            aria-pressed={selection.includes(i)}
            aria-label={`${letter}, linha ${Math.floor(i / 5) + 1}, coluna ${(i % 5) + 1}`}
            disabled={disabled}
            onClick={() =>
              setSelection((current) =>
                current.includes(i)
                  ? current.slice(0, current.indexOf(i))
                  : [...current, i],
              )
            }
          >
            {letter}
          </Button>
        ))}
      </div>
      <div className="selected-word" aria-live="polite">
        {selection.map((i) => grid[i]).join(" ") || "Sua palavra aparece aqui"}
      </div>
      <div className="inline-controls">
        <Button
          variant="outline"
          disabled={disabled || !selection.length}
          onClick={() => setSelection([])}
        >
          <RotateCcw size={16} />
          Limpar
        </Button>
        <Button
          disabled={disabled || !selection.length}
          onClick={() => {
            const word = selectedWord(grid, selection, 5);
            onAnswer(
              word === data.word ||
                word?.split("").reverse().join("") === data.word,
            );
          }}
        >
          Conferir <Check size={16} />
        </Button>
      </div>
    </>
  );
}

const memoryCards = ["🐱", "🦋", "🐸", "🦋", "🐸", "🐱"];
function MemoryGame({ onAnswer, disabled }: RoundProps) {
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const mismatch =
    open.length === 2 && memoryCards[open[0]] !== memoryCards[open[1]];
  function choose(index: number) {
    if (mismatch || open.includes(index) || matched.includes(index)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2 && memoryCards[next[0]] === memoryCards[next[1]]) {
      const found = [...matched, ...next];
      setMatched(found);
      setOpen([]);
      if (found.length === memoryCards.length) onAnswer(true);
    } else if (next.length === 2) onAnswer(false);
  }
  return (
    <>
      <p className="round-caption">
        {matched.length / 2} de 3 pares encontrados
      </p>
      <div className="memory-grid">
        {memoryCards.map((emoji, i) => {
          const visible = open.includes(i) || matched.includes(i);
          return (
            <Button
              variant="outline"
              className={cn("memory-tile", matched.includes(i) && "found")}
              key={i}
              disabled={disabled || matched.includes(i) || mismatch}
              onClick={() => choose(i)}
              aria-label={`Carta ${i + 1}${visible ? `: ${emoji}` : ", virada"}`}
            >
              <span aria-hidden="true">{visible ? emoji : "✦"}</span>
            </Button>
          );
        })}
      </div>
      {mismatch && (
        <Button variant="outline" onClick={() => setOpen([])}>
          Virar as cartas e tentar outro par <RotateCcw size={16} />
        </Button>
      )}
    </>
  );
}

function TraceLetter({ round, onAnswer, disabled }: RoundProps) {
  const [drawing, setDrawing] = useState<Point[][]>([]);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [coverage, setCoverage] = useState<number | null>(null);
  const activePointer = useRef<number | null>(null);
  const data = letterPaths[round];
  function point(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 320,
      y: ((event.clientY - rect.top) / rect.height) * 280,
    };
  }
  function end(event: PointerEvent<SVGSVGElement>) {
    if (activePointer.current === event.pointerId) {
      activePointer.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }
  return (
    <>
      <div className="trace-board">
        <svg
          viewBox="0 0 320 280"
          role="img"
          aria-label={`Caminho para desenhar a letra ${data.letter}`}
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            if (disabled || activePointer.current !== null) return;
            activePointer.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            const p = point(e);
            setDrawing((current) => [...current, [p]]);
            setCoverage(null);
          }}
          onPointerMove={(e) => {
            if (disabled || activePointer.current !== e.pointerId) return;
            const p = point(e);
            setDrawing((current) => [
              ...current.slice(0, -1),
              [...current[current.length - 1], p],
            ]);
          }}
          onPointerUp={end}
          onPointerCancel={end}
        >
          {data.strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={stroke.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#d7cbe7"
              strokeWidth="27"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {data.strokes.map((stroke, i) => (
            <polyline
              key={`guide-${i}`}
              points={stroke.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#9b80bf"
              strokeWidth="3"
              strokeDasharray="4 9"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {drawing.map((stroke, i) => (
            <polyline
              key={`stroke-${i}`}
              points={stroke.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#7954b6"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>
      <div className="inline-controls">
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setDrawing([]);
            setCoverage(null);
          }}
        >
          <RotateCcw size={16} />
          Limpar desenho
        </Button>
        <Button
          disabled={disabled || drawing.length === 0}
          onClick={() => {
            const value = traceCoverage(data.strokes, drawing);
            setCoverage(value);
            onAnswer(value >= 0.85);
          }}
        >
          Conferir meu traço <Check size={16} />
        </Button>
      </div>
      {coverage !== null && coverage < 0.85 && (
        <p role="status" className="round-caption">
          Você percorreu {Math.round(coverage * 100)}% do caminho. Continue
          pelos trechos pontilhados!
        </p>
      )}
      <Button
        variant="ghost"
        disabled={disabled}
        aria-expanded={keyboardMode}
        onClick={() => setKeyboardMode((mode) => !mode)}
      >
        Prefiro uma atividade por teclado
      </Button>
      {keyboardMode && (
        <div className="keyboard-alternative">
          <p>
            Encontre a letra do modelo: <strong>{data.letter}</strong>
          </p>
          <div className="answer-options">
            {["A", "L", "E"].map((letter) => (
              <Button
                key={letter}
                variant="outline"
                className="answer-tile"
                disabled={disabled}
                onClick={() => onAnswer(letter === data.letter)}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
