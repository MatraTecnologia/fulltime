export type PetAction = "pet" | "feed" | "bathe" | "sleep" | "play";
export type PetRoom = "lavender" | "mint" | "peach";
export type OwlPet = {
  name: string;
  food: number;
  clean: number;
  energy: number;
  joy: number;
  sleeping: boolean;
  room: PetRoom;
  careCount: number;
  updatedAt: number;
};

export const initialPet: OwlPet = {
  name: "Luna",
  food: 75,
  clean: 85,
  energy: 80,
  joy: 70,
  sleeping: false,
  room: "lavender",
  careCount: 0,
  updatedAt: 0,
};

const clamp = (value: number) => Math.max(20, Math.min(100, value));

// Gentle needs: time away never takes a need below 20 or removes friendship.
export function settlePet(pet: OwlPet, now: number): OwlPet {
  if (!pet.updatedAt) return { ...pet, updatedAt: now };
  const minutes = Math.max(0, Math.min(480, (now - pet.updatedAt) / 60_000));
  return {
    ...pet,
    food: clamp(pet.food - minutes * 0.035),
    clean: clamp(pet.clean - minutes * 0.025),
    joy: clamp(pet.joy - minutes * 0.02),
    energy: clamp(pet.energy + minutes * (pet.sleeping ? 3 : -0.03)),
    updatedAt: now,
  };
}

export function careForPet(pet: OwlPet, action: PetAction, now: number): OwlPet {
  const current = settlePet(pet, now);
  if (current.sleeping && action !== "sleep") return current;
  const changes: Partial<OwlPet> = {
    pet: { joy: clamp(current.joy + 12) },
    feed: { food: clamp(current.food + 22), joy: clamp(current.joy + 4) },
    bathe: { clean: clamp(current.clean + 25), joy: clamp(current.joy + 5) },
    sleep: { sleeping: !current.sleeping, energy: clamp(current.energy + (current.sleeping ? 0 : 10)) },
    play: { joy: clamp(current.joy + 20), energy: clamp(current.energy - 5) },
  }[action];
  return { ...current, ...changes, careCount: current.careCount + 1 };
}

export function parsePet(raw: unknown, now: number): OwlPet {
  if (!raw || typeof raw !== "object") return { ...initialPet, updatedAt: now };
  const data = raw as Partial<OwlPet>;
  const meter = (key: "food" | "clean" | "energy" | "joy") =>
    typeof data[key] === "number" && Number.isFinite(data[key])
      ? clamp(data[key])
      : initialPet[key];
  return settlePet({
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim().slice(0, 20) : initialPet.name,
    food: meter("food"), clean: meter("clean"), energy: meter("energy"), joy: meter("joy"),
    sleeping: data.sleeping === true,
    room: data.room === "mint" || data.room === "peach" ? data.room : "lavender",
    careCount: typeof data.careCount === "number" && Number.isSafeInteger(data.careCount)
      ? Math.max(0, data.careCount) : 0,
    updatedAt: typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt) && data.updatedAt > 0
      ? Math.min(now, data.updatedAt) : now,
  }, now);
}
