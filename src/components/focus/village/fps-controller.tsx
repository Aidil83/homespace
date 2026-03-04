"use client";

import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { getTerrainHeight, type TerrainData } from "@/lib/village/terrain";

const WALK_SPEED = 4;
const SPRINT_SPEED = 8;
const JUMP_VELOCITY = 5;
const GRAVITY = 20;
const EYE_HEIGHT = 1.7;
const WORLD_BOUND = 80;

interface FpsControllerProps {
  onExit: () => void;
  terrain: TerrainData;
}

export function FpsController({ onExit, terrain }: FpsControllerProps) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Set<string>>(new Set());
  const isGrounded = useRef(true);

  useEffect(() => {
    const startY = getTerrainHeight(terrain.heightMap, 10, 10) + EYE_HEIGHT;
    camera.position.set(10, startY, 10);
  }, [camera, terrain]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current.add(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current.delete(e.code);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  /* eslint-disable react-hooks/immutability -- direct camera mutation is standard Three.js */
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const speed = keys.current.has("ShiftLeft") || keys.current.has("ShiftRight") ? SPRINT_SPEED : WALK_SPEED;

    // Direction from camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    // Movement input
    const move = new THREE.Vector3();
    if (keys.current.has("KeyW")) move.add(forward);
    if (keys.current.has("KeyS")) move.sub(forward);
    if (keys.current.has("KeyD")) move.add(right);
    if (keys.current.has("KeyA")) move.sub(right);

    if (move.length() > 0) {
      move.normalize().multiplyScalar(speed * dt);
      camera.position.add(move);
    }

    // Jump
    if (keys.current.has("Space") && isGrounded.current) {
      velocity.current.y = JUMP_VELOCITY;
      isGrounded.current = false;
    }

    // Gravity
    velocity.current.y -= GRAVITY * dt;
    camera.position.y += velocity.current.y * dt;

    // Terrain-aware floor height
    const floorY = getTerrainHeight(terrain.heightMap, camera.position.x, camera.position.z) + EYE_HEIGHT;

    if (camera.position.y <= floorY) {
      camera.position.y = floorY;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    // Clamp to world bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_BOUND, WORLD_BOUND);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -WORLD_BOUND, WORLD_BOUND);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onUnlock={onExit}
    />
  );
}
