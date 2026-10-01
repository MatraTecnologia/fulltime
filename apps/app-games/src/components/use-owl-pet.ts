"use client";

import { useEffect, useSyncExternalStore } from "react";
import { careForPet, initialPet, parsePet, settlePet, type OwlPet, type PetAction } from "@/lib/owl-pet";

const storageKey = "fulltime-corujinha-v1";
const listeners = new Set<() => void>();
let state = initialPet;
let loaded = false;
let storageAvailable = true;

function readPet() {
  try {
    return parsePet(JSON.parse(localStorage.getItem(storageKey) || "null"), Date.now());
  } catch {
    storageAvailable = false;
    return { ...initialPet, updatedAt: Date.now() };
  }
}

function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    state = readPet();
    loaded = true;
  }
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      state = readPet();
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(change: (pet: OwlPet) => OwlPet) {
  state = change(getSnapshot());
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
  listeners.forEach((notify) => notify());
}

export function useOwlPet() {
  const pet = useSyncExternalStore(subscribe, getSnapshot, () => initialPet);
  useEffect(() => {
    const tick = () => update((current) => settlePet(current, Date.now()));
    const interval = window.setInterval(tick, 30_000);
    const onVisibility = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return {
    pet,
    storageAvailable,
    care: (action: PetAction) => update((current) => careForPet(current, action, Date.now())),
    customize: (change: Partial<Pick<OwlPet, "name" | "room">>) =>
      update((current) => ({ ...settlePet(current, Date.now()), ...change })),
  };
}
