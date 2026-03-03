const GOLDEN_ANGLE_DEG = 137.5;
const SPACING = 8;

export function getSpiralPosition(index: number): { x: number; z: number; rotation: number } {
  const angle = index * GOLDEN_ANGLE_DEG * (Math.PI / 180);
  const radius = Math.sqrt(index) * SPACING;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  // Face toward center
  const rotation = Math.atan2(-x, -z);
  return { x, z, rotation };
}
