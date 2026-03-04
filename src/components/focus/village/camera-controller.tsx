"use client";
/* eslint-disable react-hooks/immutability */

import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ISO_ELEVATION = Math.asin(1 / Math.sqrt(3)); // ~35.26°
const AUTO_ROTATE_SPEED = 0.1; // rad/s
const CAMERA_RADIUS = 80;
const FRUSTUM_MIN = 30;
const FRUSTUM_MAX = 80;
const DEFAULT_FRUSTUM = 55;

export function IsometricCamera() {
  const { camera, gl, size } = useThree();
  const azimuthRef = useRef(Math.PI / 4);
  const frustumRef = useRef(DEFAULT_FRUSTUM);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const autoRotateRef = useRef(true);
  const resumeTimerRef = useRef(0);

  // Configure orthographic camera on mount
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.near = -200;
      camera.far = 500;
    }
  }, [camera]);

  // Mouse/touch handlers for drag rotation
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    autoRotateRef.current = false;
    resumeTimerRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    azimuthRef.current -= dx * 0.005;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    resumeTimerRef.current = 0;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    frustumRef.current = THREE.MathUtils.clamp(
      frustumRef.current + e.deltaY * 0.05,
      FRUSTUM_MIN,
      FRUSTUM_MAX,
    );
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointermove", handlePointerMove);
    dom.addEventListener("pointerup", handlePointerUp);
    dom.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointermove", handlePointerMove);
      dom.removeEventListener("pointerup", handlePointerUp);
      dom.removeEventListener("wheel", handleWheel);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel]);

  useFrame((_, delta) => {
    // Resume auto-rotate after release
    if (!isDraggingRef.current && !autoRotateRef.current) {
      resumeTimerRef.current += delta;
      if (resumeTimerRef.current > 2) {
        autoRotateRef.current = true;
      }
    }

    if (autoRotateRef.current) {
      azimuthRef.current += AUTO_ROTATE_SPEED * delta;
    }

    const azimuth = azimuthRef.current;
    const frustum = frustumRef.current;

    // Position camera on sphere
    const x = Math.cos(azimuth) * Math.cos(ISO_ELEVATION) * CAMERA_RADIUS;
    const y = Math.sin(ISO_ELEVATION) * CAMERA_RADIUS;
    const z = Math.sin(azimuth) * Math.cos(ISO_ELEVATION) * CAMERA_RADIUS;

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);

    // Update orthographic frustum
    if (camera instanceof THREE.OrthographicCamera) {
      const aspect = size.width / size.height;
      camera.left = -frustum * aspect / 2;
      camera.right = frustum * aspect / 2;
      camera.top = frustum / 2;
      camera.bottom = -frustum / 2;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
