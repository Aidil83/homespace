import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getUnlockedTypes, type BuildingType, BUILDING_TIERS } from "@/lib/village/types";
import { BUILDING_GRID_POSITIONS, gridToWorld } from "@/lib/village/terrain";

// Map building types to grid positions for deterministic placement
function getGridPosition(buildingType: string, gridIndex: number): { x: number; z: number; rotation: number } {
  // Try to find a specific grid position for this building type
  const gridEntry = BUILDING_GRID_POSITIONS.find((b) => b.name === buildingType);
  if (gridEntry) {
    const pos = gridToWorld(gridEntry.gx, gridEntry.gy);
    return { x: pos.x, z: pos.z, rotation: 0 };
  }

  // Fallback: use grid index to assign from the position list
  if (gridIndex < BUILDING_GRID_POSITIONS.length) {
    const entry = BUILDING_GRID_POSITIONS[gridIndex];
    const pos = gridToWorld(entry.gx, entry.gy);
    return { x: pos.x, z: pos.z, rotation: 0 };
  }

  // Extra fallback for overflow (shouldn't happen with 24 slots)
  const angle = gridIndex * 137.5 * (Math.PI / 180);
  const radius = Math.sqrt(gridIndex) * 8;
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    rotation: Math.atan2(-Math.cos(angle) * radius, -Math.sin(angle) * radius),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [buildings, sessions] = await Promise.all([
      prisma.villageBuilding.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.focusSession.findMany({
        where: { userId: user.id, status: "completed" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalSessions = sessions.length;
    const totalFocusMinutes = sessions.reduce(
      (sum, s) => sum + Math.floor(s.elapsed / 60),
      0
    );

    // Calculate streak: consecutive days with at least one completed session
    let currentStreak = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayMs = 86400000;
      let checkDate = today.getTime();

      const sessionDays = new Set(
        sessions.map((s) => {
          const d = new Date(s.completedAt || s.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      // Check if today or yesterday has a session (allow for current day)
      if (!sessionDays.has(checkDate)) {
        checkDate -= dayMs;
      }

      while (sessionDays.has(checkDate)) {
        currentStreak++;
        checkDate -= dayMs;
      }
    }

    const unlockedTypes = getUnlockedTypes(totalSessions);

    return NextResponse.json({
      buildings,
      stats: { totalSessions, totalFocusMinutes, currentStreak },
      unlockedTypes,
    });
  } catch (error) {
    console.error("Village GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { buildingType } = body as { buildingType: string };

  // Validate building type exists
  const allTypes = BUILDING_TIERS.flatMap((t) => t.buildings);
  if (!allTypes.includes(buildingType as BuildingType)) {
    return NextResponse.json({ error: "Invalid building type" }, { status: 400 });
  }

  // Check tier access
  const totalSessions = await prisma.focusSession.count({
    where: { userId: user.id, status: "completed" },
  });

  const unlocked = getUnlockedTypes(totalSessions);
  if (!unlocked.includes(buildingType as BuildingType)) {
    return NextResponse.json(
      { error: "Building not yet unlocked" },
      { status: 403 }
    );
  }

  // Get next grid index
  const lastBuilding = await prisma.villageBuilding.findFirst({
    where: { userId: user.id },
    orderBy: { gridIndex: "desc" },
  });
  const gridIndex = (lastBuilding?.gridIndex ?? -1) + 1;

  // Compute grid-based position
  const { x, z, rotation } = getGridPosition(buildingType, gridIndex);

  const building = await prisma.villageBuilding.create({
    data: {
      userId: user.id,
      buildingType,
      gridIndex,
      positionX: x,
      positionZ: z,
      rotation,
    },
  });

  return NextResponse.json(building);
}
