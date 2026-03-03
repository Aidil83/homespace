/* eslint-disable react-hooks/refs -- R3F pattern: refs used imperatively in useFrame for performance */
"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { VillageBuilding } from "@/lib/village/types";
import {
  computeCreatures,
  initCreatureState,
  updateCreatureState,
  type CreatureState,
} from "@/lib/village/creatures";
import { Creature } from "./creature";

interface VillageCreaturesProps {
  buildings: VillageBuilding[];
  timerState: "idle" | "focusing" | "paused" | "break";
}

export function VillageCreatures({ buildings, timerState }: VillageCreaturesProps) {
  const configs = useMemo(() => computeCreatures(buildings), [buildings]);

  // All creature state managed in refs — no React state per frame
  const statesRef = useRef<CreatureState[]>([]);
  const walkingRefs = useRef<React.RefObject<boolean>[]>([]);
  const groupRefs = useRef<(Group | null)[]>([]);
  const prevLen = useRef(0);

  // Reinitialize when creature count changes (new buildings placed)
  if (configs.length !== prevLen.current) {
    const oldStates = statesRef.current;
    const newStates: CreatureState[] = [];
    const newWalkingRefs: React.RefObject<boolean>[] = [];

    for (let i = 0; i < configs.length; i++) {
      if (i < oldStates.length) {
        newStates.push(oldStates[i]);
        newWalkingRefs.push(walkingRefs.current[i]);
      } else {
        newStates.push(initCreatureState(configs[i]));
        newWalkingRefs.push({ current: false });
      }
    }

    statesRef.current = newStates;
    walkingRefs.current = newWalkingRefs;
    groupRefs.current.length = configs.length;
    prevLen.current = configs.length;
  }

  // Single useFrame manages ALL creature state + positions
  useFrame((state, delta) => {
    const isNight = timerState === "break";
    const elapsed = state.clock.elapsedTime;
    const states = statesRef.current;
    const groups = groupRefs.current;
    const walkRefs = walkingRefs.current;

    for (let i = 0; i < configs.length; i++) {
      const newState = updateCreatureState(
        states[i],
        configs[i],
        delta,
        elapsed,
        isNight,
      );
      states[i] = newState;

      // Signal walking state to mesh for leg animation
      if (walkRefs[i]) {
        (walkRefs[i] as { current: boolean }).current = newState.walking;
      }

      // Update position + rotation via ref
      const group = groups[i];
      if (group) {
        group.position.x = newState.x;
        group.position.z = newState.z;
        group.rotation.y = newState.facingAngle;
      }
    }
  });

  const setGroupRef = useCallback((index: number) => (el: Group | null) => {
    groupRefs.current[index] = el;
  }, []);

   
  return (
    <>
      {configs.map((config, i) => (
        <group
          key={`${config.type}-${config.name}-${i}`}
          ref={setGroupRef(i)}
          position={[
            statesRef.current[i]?.x ?? config.homeX,
            0,
            statesRef.current[i]?.z ?? config.homeZ,
          ]}
        >
          <Creature
            config={config}
            walkingRef={walkingRefs.current[i] ?? { current: false }}
          />
        </group>
      ))}
    </>
  );
}
