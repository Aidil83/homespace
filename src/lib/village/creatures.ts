import type { BuildingType, VillageBuilding } from "./types";

// --- Creature Types ---

export type CreatureType = "villager" | "guard" | "rabbit" | "fox" | "deer" | "bird";

export type VillagerVariant = "farmer" | "merchant" | "smith" | "monk";

export interface CreatureConfig {
  type: CreatureType;
  variant?: VillagerVariant | string;
  homeX: number;
  homeZ: number;
  name: string;
  wanderRadius: number;
  speed: number;
}

// --- Name Pools ---

const VILLAGER_NAMES = [
  "Aldric", "Berta", "Cedric", "Dagna", "Emund", "Freya",
  "Gunther", "Hilda", "Ingvar", "Jora", "Klaus", "Liesel",
  "Magnus", "Nora", "Olaf", "Petra", "Rolf", "Sigrid",
  "Torsten", "Ulla",
];

const GUARD_NAMES = [
  "Captain Axel", "Warden Bjorn", "Sentinel Drake", "Watch Elric",
  "Sentry Finn", "Guard Helga",
];

const RABBIT_NAMES = [
  "Clover", "Thumper", "Hazel", "Bramble", "Cotton", "Fern",
  "Pippin", "Dandelion", "Nutmeg", "Willow",
];

const FOX_NAMES = [
  "Rusty", "Ember", "Copper", "Scarlet", "Blaze",
  "Ginger", "Maple", "Ash",
];

const DEER_NAMES = [
  "Birch", "Fawn", "Oakley", "Thistle", "Moss",
  "Cedar", "Sage", "Holly",
];

const BIRD_NAMES = [
  "Swift", "Feather", "Robin", "Sparrow", "Wren",
  "Jay", "Finch", "Lark",
];

const NAME_POOLS: Record<CreatureType, string[]> = {
  villager: VILLAGER_NAMES,
  guard: GUARD_NAMES,
  rabbit: RABBIT_NAMES,
  fox: FOX_NAMES,
  deer: DEER_NAMES,
  bird: BIRD_NAMES,
};

// --- Phrase Pools ---

const VILLAGER_PHRASES = [
  "Nice day!", "The village grows!", "Back to work...",
  "Good harvest this year.", "Have you seen the fountain?",
];

const GUARD_PHRASES = [
  "All is well.", "Move along.", "Stay safe, traveler.",
  "The watch never sleeps.",
];

const RABBIT_PHRASES = ["*nibble nibble*", "*thump thump*", "*wiggles nose*", "*hops around*"];
const FOX_PHRASES = ["*yip!*", "*slinks quietly*", "*sniffs the air*", "*wags tail*"];
const DEER_PHRASES = ["*gentle snort*", "*nuzzles*", "*stamps hoof*", "*ears perk up*"];
const BIRD_PHRASES = ["*tweet tweet*", "*chirp!*", "*flaps wings*", "*sings*"];

export const PHRASE_POOLS: Record<CreatureType, string[]> = {
  villager: VILLAGER_PHRASES,
  guard: GUARD_PHRASES,
  rabbit: RABBIT_PHRASES,
  fox: FOX_PHRASES,
  deer: DEER_PHRASES,
  bird: BIRD_PHRASES,
};

// --- Deterministic Name Selection ---

function getName(type: CreatureType, index: number): string {
  const pool = NAME_POOLS[type];
  return pool[index % pool.length];
}

// --- Variant Assignment ---

const BUILDING_TO_VARIANT: Partial<Record<BuildingType, VillagerVariant>> = {
  farm: "farmer",
  market: "merchant",
  blacksmith: "smith",
  chapel: "monk",
};

// --- Spawn Rules ---

interface SpawnRule {
  type: CreatureType;
  count: number;
  variant?: VillagerVariant | string;
}

const BUILDING_SPAWN_RULES: Partial<Record<BuildingType, SpawnRule[]>> = {
  cottage: [
    { type: "villager", count: 1 },
    // alternating fox/rabbit handled in spawn logic
  ],
  farm: [
    { type: "villager", count: 1, variant: "farmer" },
    { type: "rabbit", count: 3 },
  ],
  tavern: [
    { type: "villager", count: 2 },
  ],
  blacksmith: [
    { type: "villager", count: 1, variant: "smith" },
  ],
  market: [
    { type: "villager", count: 1, variant: "merchant" },
  ],
  chapel: [
    { type: "villager", count: 1, variant: "monk" },
  ],
  watchtower: [
    { type: "guard", count: 1 },
  ],
  stable: [
    { type: "deer", count: 2 },
  ],
  library: [
    { type: "villager", count: 1 },
  ],
  bakery: [
    { type: "villager", count: 1 },
  ],
  brewery: [
    { type: "villager", count: 1 },
  ],
  barracks: [
    { type: "guard", count: 2 },
  ],
};

// --- Spawn Computation ---

export function computeCreatures(buildings: VillageBuilding[]): CreatureConfig[] {
  const creatures: CreatureConfig[] = [];
  const counters: Record<CreatureType, number> = {
    villager: 0, guard: 0, rabbit: 0, fox: 0, deer: 0, bird: 0,
  };

  // Base creatures: 2 rabbits near fountain, 1 guard if no watchtower
  const hasWatchtower = buildings.some((b) => b.buildingType === "watchtower");

  creatures.push({
    type: "rabbit",
    homeX: 2,
    homeZ: 2,
    name: getName("rabbit", counters.rabbit++),
    wanderRadius: 5,
    speed: 1,
  });
  creatures.push({
    type: "rabbit",
    homeX: -2,
    homeZ: 3,
    name: getName("rabbit", counters.rabbit++),
    wanderRadius: 5,
    speed: 1,
  });

  if (!hasWatchtower) {
    creatures.push({
      type: "guard",
      homeX: 0,
      homeZ: 0,
      name: getName("guard", counters.guard++),
      wanderRadius: 25,
      speed: 2,
    });
  }

  // 4 birds (roam between buildings) — alternating normal/red variant
  for (let i = 0; i < 4; i++) {
    const bIdx = i % Math.max(buildings.length, 1);
    const b = buildings[bIdx];
    creatures.push({
      type: "bird",
      variant: i % 2 === 0 ? undefined : "red",
      homeX: b ? b.positionX : i * 5,
      homeZ: b ? b.positionZ : i * 3,
      name: getName("bird", counters.bird++),
      wanderRadius: 30,
      speed: 1.5,
    });
  }

  // Per-building spawns
  let cottageIndex = 0;
  for (const building of buildings) {
    const rules = BUILDING_SPAWN_RULES[building.buildingType];
    if (!rules) continue;

    for (const rule of rules) {
      for (let i = 0; i < rule.count; i++) {
        const variant = rule.variant || BUILDING_TO_VARIANT[building.buildingType];
        creatures.push({
          type: rule.type,
          variant: rule.type === "villager" ? variant : rule.variant,
          homeX: building.positionX,
          homeZ: building.positionZ,
          name: getName(rule.type, counters[rule.type]++),
          wanderRadius: rule.type === "guard" ? 25 : rule.type === "rabbit" ? 4
            : rule.type === "deer" ? 8 : 6,
          speed: rule.type === "guard" ? 2 : rule.type === "villager" ? 1.5
            : rule.type === "deer" ? 1.2 : 1,
        });
      }
    }

    // Cottage gets alternating fox/rabbit
    if (building.buildingType === "cottage") {
      const petType: CreatureType = cottageIndex % 2 === 0 ? "fox" : "rabbit";
      creatures.push({
        type: petType,
        homeX: building.positionX,
        homeZ: building.positionZ,
        name: getName(petType, counters[petType]++),
        wanderRadius: petType === "fox" ? 10 : 5,
        speed: petType === "fox" ? 1.2 : 1,
      });
      cottageIndex++;
    }
  }

  return creatures;
}

// --- Movement Math ---

export interface CreatureState {
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  pause: number;
  walking: boolean;
  facingAngle: number;
}

export function initCreatureState(config: CreatureConfig): CreatureState {
  return {
    x: config.homeX + (Math.random() - 0.5) * 2,
    z: config.homeZ + (Math.random() - 0.5) * 2,
    targetX: config.homeX,
    targetZ: config.homeZ,
    pause: Math.random() * 2,
    walking: false,
    facingAngle: Math.random() * Math.PI * 2,
  };
}

export function pickNewTarget(config: CreatureConfig): { x: number; z: number } {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * config.wanderRadius;
  return {
    x: config.homeX + Math.cos(angle) * dist,
    z: config.homeZ + Math.sin(angle) * dist,
  };
}

/** Returns patrol position for guard on a circle around origin */
export function getPatrolPosition(time: number, speed: number, radius: number): { x: number; z: number } {
  const angle = time * speed * 0.1;
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  };
}

export function updateCreatureState(
  state: CreatureState,
  config: CreatureConfig,
  delta: number,
  elapsedTime: number,
  isNight: boolean,
): CreatureState {
  const speedMult = isNight ? 0.5 : 1;
  const speed = config.speed * speedMult;

  // Guard uses patrol behavior
  if (config.type === "guard") {
    const patrol = getPatrolPosition(elapsedTime, speed, config.wanderRadius);
    const dx = patrol.x - state.x;
    const dz = patrol.z - state.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const step = speed * delta;

    if (dist > 0.1) {
      const ratio = Math.min(step / dist, 1);
      return {
        ...state,
        x: state.x + dx * ratio,
        z: state.z + dz * ratio,
        walking: true,
        facingAngle: Math.atan2(dx, dz),
      };
    }
    return { ...state, walking: true, facingAngle: Math.atan2(dx, dz) };
  }

  // Bird uses different flight pattern — wider range, longer movements
  if (config.type === "bird") {
    if (state.pause > 0) {
      return { ...state, pause: state.pause - delta, walking: false };
    }

    const dx = state.targetX - state.x;
    const dz = state.targetZ - state.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1) {
      const newTarget = pickNewTarget(config);
      return {
        ...state,
        targetX: newTarget.x,
        targetZ: newTarget.z,
        pause: 4 + Math.random() * 8,
        walking: false,
      };
    }

    const step = speed * delta;
    const ratio = Math.min(step / dist, 1);
    return {
      ...state,
      x: state.x + dx * ratio,
      z: state.z + dz * ratio,
      walking: true,
      facingAngle: Math.atan2(dx, dz),
    };
  }

  // Wander behavior for all other creatures (rabbit, fox, deer, villager)
  if (state.pause > 0) {
    return { ...state, pause: state.pause - delta, walking: false };
  }

  const dx = state.targetX - state.x;
  const dz = state.targetZ - state.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 0.3) {
    const newTarget = pickNewTarget(config);
    return {
      ...state,
      targetX: newTarget.x,
      targetZ: newTarget.z,
      pause: 2 + Math.random() * 2,
      walking: false,
    };
  }

  const step = speed * delta;
  const ratio = Math.min(step / dist, 1);
  return {
    ...state,
    x: state.x + dx * ratio,
    z: state.z + dz * ratio,
    walking: true,
    facingAngle: Math.atan2(dx, dz),
  };
}
