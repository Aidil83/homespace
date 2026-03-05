"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID, TILE_SIZE, type TerrainData } from "@/lib/village/terrain";

interface WaterMeshProps {
  terrain: TerrainData;
}

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 127.1 + 0.7) * 43758.5453) % 1;
}

function createWaterMaterial(
  color: string,
  baseOpacity: number,
  emissive: string,
  emissiveIntensity: number,
  timeUniform: { value: number },
) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: baseOpacity,
    roughness: 0.05,
    metalness: 0.4,
    emissive,
    emissiveIntensity,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeUniform;

    // Vertex: add varying for world position
    shader.vertexShader = "varying vec3 vWPos;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      #ifdef USE_INSTANCING
        vWPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`,
    );

    // Fragment: add varying + uniform
    shader.fragmentShader =
      "varying vec3 vWPos;\nuniform float uTime;\n" + shader.fragmentShader;

    // Animated ripple normal perturbation (3 octaves)
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      float r1 = sin(vWPos.x * 1.5 + uTime * 1.2) * cos(vWPos.z * 2.0 + uTime * 0.9) * 0.2;
      float r2 = sin(vWPos.x * 3.0 - uTime * 1.8) * cos(vWPos.z * 2.5 + uTime * 1.4) * 0.1;
      float r3 = sin(vWPos.x * 5.0 + uTime * 2.5) * cos(vWPos.z * 4.5 - uTime * 1.1) * 0.05;
      normal.x += r1 + r2 + r3;
      normal.z += r1 * 0.7 - r2 * 0.5 + r3 * 0.3;
      normal = normalize(normal);`,
    );

    // Fresnel-based opacity — more opaque at glancing angles
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <output_fragment>",
      `#include <output_fragment>
      vec3 vDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(normal, vDir)), 2.0);
      gl_FragColor.a = mix(0.3, 0.85, fresnel);`,
    );
  };

  return mat;
}

export function WaterMesh({ terrain }: WaterMeshProps) {
  const regularRef = useRef<THREE.InstancedMesh>(null);
  const deepRef = useRef<THREE.InstancedMesh>(null);
  const timeUniform = useRef({ value: 0 });

  // Categorize water tiles into regular and deep
  const { regularTiles, deepTiles } = useMemo(() => {
    const regular: { x: number; z: number; seed: number }[] = [];
    const deep: { x: number; z: number; seed: number }[] = [];

    for (const { gx, gy } of terrain.waterTiles) {
      const x = (gx - GRID / 2 + 0.5) * TILE_SIZE;
      const z = (gy - GRID / 2 + 0.5) * TILE_SIZE;
      const seed = gx * GRID + gy;

      // Check if surrounded by water on 3+ sides = deep
      let waterNeighbors = 0;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          if (terrain.tileTypes[ny * GRID + nx] === "water") waterNeighbors++;
        }
      }

      if (waterNeighbors >= 3) {
        deep.push({ x, z, seed });
      } else {
        regular.push({ x, z, seed });
      }
    }

    return { regularTiles: regular, deepTiles: deep };
  }, [terrain]);

  const regularMat = useMemo(
    () => createWaterMaterial("#2980B9", 0.6, "#1A8DBB", 0.12, timeUniform.current),
    [],
  );
  const deepMat = useMemo(
    () => createWaterMaterial("#1A5276", 0.7, "#0E6D9C", 0.08, timeUniform.current),
    [],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    timeUniform.current.value = t;

    // Enhanced caustic shimmer — R3F: mutating Three.js material properties per-frame is standard practice
    const caustic = Math.sin(t * 2) * 0.05 + Math.sin(t * 3.7) * 0.03;
    // eslint-disable-next-line react-hooks/immutability
    regularMat.emissiveIntensity = 0.12 + caustic;
    // eslint-disable-next-line react-hooks/immutability
    deepMat.emissiveIntensity = 0.08 + caustic * 0.5;

    if (regularRef.current) {
      for (let i = 0; i < regularTiles.length; i++) {
        const tile = regularTiles[i];
        const y = 0.15 + Math.sin(t + seededRandom(tile.seed) * 6.28) * 0.03;
        dummy.position.set(tile.x, y, tile.z);
        dummy.scale.set(TILE_SIZE, 0.3, TILE_SIZE);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        regularRef.current.setMatrixAt(i, dummy.matrix);
      }
      regularRef.current.instanceMatrix.needsUpdate = true;
    }

    if (deepRef.current) {
      for (let i = 0; i < deepTiles.length; i++) {
        const tile = deepTiles[i];
        const y = 0.15 + Math.sin(t * 0.8 + seededRandom(tile.seed) * 6.28) * 0.02;
        dummy.position.set(tile.x, y, tile.z);
        dummy.scale.set(TILE_SIZE, 0.3, TILE_SIZE);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        deepRef.current.setMatrixAt(i, dummy.matrix);
      }
      deepRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <group>
      {regularTiles.length > 0 && (
        <instancedMesh ref={regularRef} args={[boxGeo, regularMat, regularTiles.length]} />
      )}
      {deepTiles.length > 0 && (
        <instancedMesh ref={deepRef} args={[boxGeo, deepMat, deepTiles.length]} />
      )}
    </group>
  );
}
