"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { games, type GameId } from "@/lib/games";
import { voiceClipUrl, type VoiceClipId } from "@/lib/voice-clips";

type Settings = { sound: boolean; calm: boolean; largeText: boolean };
type Session = { gameId: GameId; date: string; stars: number };
type LearningState = { name: string; settings: Settings; sessions: Session[] };
const initial: LearningState = {
  name: "Explorador",
  settings: { sound: false, calm: false, largeText: false },
  sessions: [],
};
const storageKey = "fulltime-brincar-v1";
let state: LearningState = initial;
let loaded = false;
let storageAvailable = true;
const listeners = new Set<() => void>();

function readState() {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!raw || typeof raw !== "object") return initial;
    const data = raw as Partial<LearningState>;
    return {
      name:
        typeof data.name === "string" && data.name.trim()
          ? data.name.slice(0, 24)
          : initial.name,
      settings: {
        sound: data.settings?.sound === true,
        calm: data.settings?.calm === true,
        largeText: data.settings?.largeText === true,
      },
      sessions: Array.isArray(data.sessions)
        ? data.sessions
            .filter(
              (s) =>
                s &&
                games.some((g) => g.id === s.gameId) &&
                typeof s.date === "string" &&
                Number.isFinite(Date.parse(s.date)) &&
                s.stars === 3,
            )
            .slice(-100)
        : [],
    };
  } catch {
    storageAvailable = false;
    return initial;
  }
}

function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    state = readState();
    loaded = true;
  }
  return state;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      state = readState();
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
function update(change: (current: LearningState) => LearningState) {
  state = change(getSnapshot());
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
  listeners.forEach((fn) => fn());
}

type LearningContextValue = LearningState & {
  storageAvailable: boolean;
  setName: (name: string) => void;
  setSettings: (settings: Partial<Settings>) => void;
  completeGame: (id: GameId) => void;
  speak: (clip: VoiceClipId, force?: boolean) => void;
  stopSpeaking: () => void;
  speakingClip: VoiceClipId | null;
  voiceError: string | null;
};
const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => initial);
  const player = useRef<HTMLAudioElement | null>(null);
  const playback = useRef(0);
  const [speakingClip, setSpeakingClip] = useState<VoiceClipId | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const stopSpeaking = useCallback(() => {
    playback.current += 1;
    if (player.current) {
      player.current.pause();
      player.current.removeAttribute("src");
      player.current.load();
    }
    setSpeakingClip(null);
  }, []);
  useEffect(() => () => { player.current?.pause(); }, []);
  const speak = useCallback(
    (clip: VoiceClipId, force = false) => {
      if (!current.settings.sound && !force) return;
      stopSpeaking();
      const request = playback.current;
      const audio = new Audio(voiceClipUrl(clip));
      setVoiceError(null);
      audio.volume = 0.85;
      audio.playbackRate = current.settings.calm ? 0.9 : 1;
      audio.onplaying = () => { if (request === playback.current) setSpeakingClip(clip); };
      audio.onended = () => { if (request === playback.current) setSpeakingClip(null); };
      const failed = () => {
        if (request !== playback.current) return;
        setSpeakingClip(null);
        setVoiceError("Não consegui tocar a voz agora. Toque em Ouvir para tentar de novo.");
      };
      audio.onerror = failed;
      player.current = audio;
      void audio.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        failed();
      });
    },
    [current.settings.sound, current.settings.calm, stopSpeaking],
  );
  return (
    <LearningContext.Provider
      value={{
        ...current,
        storageAvailable,
        setName: (name) =>
          update((s) => ({
            ...s,
            name: name.trim().slice(0, 24) || "Explorador",
          })),
        setSettings: (settings) =>
          update((s) => ({ ...s, settings: { ...s.settings, ...settings } })),
        completeGame: (gameId) =>
          update((s) => ({
            ...s,
            sessions: [
              ...s.sessions,
              { gameId, date: new Date().toISOString(), stars: 3 },
            ].slice(-100),
          })),
        speak,
        stopSpeaking,
        speakingClip,
        voiceError,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error("LearningProvider ausente");
  return context;
}
