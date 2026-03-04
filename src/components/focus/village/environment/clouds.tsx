"use client";
/* eslint-disable react-hooks/purity */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CLOUD_COUNT = 8;
const CLOUD_Y = 35;
const CLOUD_RANGE_X = 80;

export function Clouds() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const clouds = useMemo(() => {
    return Array.from({ length: CLOUD_COUNT }, () => ({
      x: (Math.random() - 0.5) * CLOUD_RANGE_X * 2,
      y: CLOUD_Y + (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * CLOUD_RANGE_X * 2,
      speed: 0.15 + Math.random() * 0.1,
      scaleX: 4 + Math.random() * 3,
      scaleY: 1.2 + Math.random() * 0.8,
      scaleZ: 3 + Math.random() * 2,
    }));
  }, []);

  // We use 3 ellipsoids per cloud = CLOUD_COUNT * 3 instances
  const totalInstances = CLOUD_COUNT * 3;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const c = clouds[i];
      const x = ((c.x + t * c.speed + CLOUD_RANGE_X) % (CLOUD_RANGE_X * 2)) - CLOUD_RANGE_X;

      // Main ellipsoid
      dummy.position.set(x, c.y, c.z);
      dummy.scale.set(c.scaleX, c.scaleY, c.scaleZ);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i * 3, dummy.matrix);

      // Right ellipsoid
      dummy.position.set(x + c.scaleX * 0.5, c.y + c.scaleY * 0.15, c.z);
      dummy.scale.set(c.scaleX * 0.7, c.scaleY * 0.9, c.scaleZ * 0.8);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i * 3 + 1, dummy.matrix);

      // Left ellipsoid
      dummy.position.set(x - c.scaleX * 0.4, c.y - c.scaleY * 0.05, c.z);
      dummy.scale.set(c.scaleX * 0.6, c.scaleY * 0.8, c.scaleZ * 0.7);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i * 3 + 2, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalInstances]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
    </instancedMesh>
  );
}
