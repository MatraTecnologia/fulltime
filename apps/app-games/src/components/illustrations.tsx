import { cn } from "@/lib/utils";

export function Owl({
  className,
  sleeping = false,
  happy = false,
}: {
  className?: string;
  sleeping?: boolean;
  happy?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      aria-hidden="true"
      className={cn("owl", sleeping && "owl-sleeping", happy && "owl-happy", className)}
    >
      <ellipse cx="143" cy="254" rx="77" ry="10" fill="#DAD2EC" />
      <path
        d="M77 82 64 38l47 24c22-8 43-8 65 0l47-24-13 47c22 31 21 95-1 129-32 46-102 46-132 0-27-39-25-99 0-132Z"
        fill="#9171BD"
      />
      <path
        d="M90 159c8-30 101-30 109 0l5 38c-7 59-116 63-124 0l10-38Z"
        fill="#C9B5E2"
      />
      <ellipse cx="104" cy="116" rx="43" ry="47" fill="#FFF9EC" />
      <ellipse cx="179" cy="116" rx="43" ry="47" fill="#FFF9EC" />
      <g className="owl-eyes">
        <g className="owl-gaze">
          <ellipse cx="111" cy="122" rx="18" ry="23" fill="#3B2C56" />
          <ellipse cx="174" cy="122" rx="18" ry="23" fill="#3B2C56" />
          <circle cx="117" cy="115" r="6" fill="white" />
          <circle cx="180" cy="115" r="6" fill="white" />
        </g>
      </g>
      <g className="owl-closed-eyes" stroke="#3B2C56" strokeWidth="6" strokeLinecap="round">
        <path d={happy ? "M95 128q16-23 32 0M158 128q16-23 32 0" : "M95 122q16 18 32 0M158 122q16 18 32 0"} />
      </g>
      <path d="m130 149 12 17 13-17c-8-8-17-8-25 0Z" fill="#F6BB60" />
      <ellipse cx="82" cy="148" rx="12" ry="7" fill="#E8A5B1" />
      <ellipse cx="203" cy="148" rx="12" ry="7" fill="#E8A5B1" />
      <path className="owl-wing-left" d="M65 155c-28 17-28 65 1 66l24-49" fill="#7955A8" />
      <path className="owl-wing-right" d="M218 153c36-14 32-46 22-57-15 22-24 28-35 31" fill="#7955A8" />
      <path
        d="m123 186 7 7m25-7 7 7m-30 12 7 7"
        stroke="#A78BC9"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M107 242v9m13-9v9m43-9v9m13-9v9"
        stroke="#E6AD5B"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="m36 77 4-12 4 12 12 4-12 4-4 12-4-12-12-4ZM232 197l4-9 4 9 9 4-9 4-4 9-4-9-9-4Z"
        fill="#E6B856"
      />
    </svg>
  );
}

export function GameArt({ type }: { type: string }) {
  return (
    <div className={`game-art art-${type}`} aria-hidden="true">
      {type === "letters" && (
        <>
          <span className="letter-block block-one">A</span>
          <span className="letter-block block-two">B</span>
          <span className="letter-block block-three">C</span>
          <span className="art-spark">✦</span>
        </>
      )}
      {type === "syllables" && (
        <>
          <span className="syllable-block">BO</span>
          <span className="art-plus">+</span>
          <span className="syllable-block">LA</span>
          <span className="art-ball">⚽</span>
        </>
      )}
      {type === "words" && (
        <div className="mini-grid">
          {"SOLAGATOM".split("").map((x, i) => (
            <span key={i} className={i < 3 ? "marked" : ""}>
              {x}
            </span>
          ))}
        </div>
      )}
      {type === "draw" && (
        <>
          <span className="trace-a">A</span>
          <span className="art-pencil">✏️</span>
          <span className="art-spark">✦</span>
        </>
      )}
      {type === "emoji" && (
        <>
          <span className="emoji-face">🦁</span>
          <span className="emoji-question">?</span>
          <span className="art-spark">✦</span>
        </>
      )}
      {type === "memory" && (
        <>
          <span className="memory-art">🐱</span>
          <span className="memory-art second">🐱</span>
          <span className="art-spark">✦</span>
        </>
      )}
      {type === "numbers" && (
        <>
          <span className="number-art">1</span>
          <span className="number-art second">2</span>
          <span className="number-art third">3</span>
        </>
      )}
      {type === "colors" && (
        <>
          <span className="color-drop drop-one" />
          <span className="color-drop drop-two" />
          <span className="color-drop drop-three" />
        </>
      )}
    </div>
  );
}
