"use client";

import { Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Owl } from "./illustrations";
import { useLearning } from "./learning-provider";
import { cn } from "@/lib/utils";

export function LearningMascot({
  mascotName,
  message,
  mood = "guide",
  children,
}: {
  mascotName: string;
  message: string;
  mood?: "guide" | "celebrate" | "encourage";
  children?: React.ReactNode;
}) {
  const { speak } = useLearning();
  return (
    <div className={cn("learning-mascot", `mascot-${mood}`)}>
      <div className="mascot-character" aria-hidden="true">
        <Owl happy={mood === "celebrate"} />
        {mood === "celebrate" && (
          <span className="mascot-sparkles"><span>★</span><span>✦</span><span>★</span></span>
        )}
      </div>
      <div className="mascot-speech">
        <span className="mascot-name">{mascotName}, sua companheira</span>
        <p className="mascot-message" role="status" aria-live="polite" aria-atomic="true">{message}</p>
        {children}
      </div>
      <Button variant="ghost" size="icon" className="mascot-listen" onClick={() => speak(message, true)} aria-label={`Ouvir ${mascotName}`}>
        <Volume2 size={20} aria-hidden="true" />
      </Button>
    </div>
  );
}

export function RewardStars({ count = 3 }: { count?: number }) {
  return (
    <span className="reward-stars" role="img" aria-label={`${count} estrelas conquistadas`}>
      {Array.from({ length: count }, (_, index) => <span key={index} aria-hidden="true" style={{ animationDelay: `${index * 150}ms` }}>★</span>)}
    </span>
  );
}
