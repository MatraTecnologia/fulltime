import clips from "./voice-clips.json";
import type { GameId } from "./games";

export type VoiceClipId = keyof typeof clips;
export const voiceClips = clips;

export function gameVoiceClip(gameId: GameId, round: number, kind: "instruction" | "hint"): VoiceClipId {
  const id = `${gameId}-${kind}-${round}`;
  return id in clips ? id as VoiceClipId : "guide";
}

export function voiceClipUrl(id: VoiceClipId) {
  return `/audio/luna/v1/${id}.mp3`;
}
