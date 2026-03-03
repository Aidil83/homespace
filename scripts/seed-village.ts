import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const GOLDEN_ANGLE_DEG = 137.5;
const SPACING = 8;

function getSpiralPosition(index: number) {
  const angle = index * GOLDEN_ANGLE_DEG * (Math.PI / 180);
  const radius = Math.sqrt(index) * SPACING;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const rotation = Math.atan2(-x, -z);
  return { x, z, rotation };
}

const BUILDINGS = [
  "cottage",
  "farm",
  "well",
  "garden",
  "windmill",
  "cottage",
  "market",
  "blacksmith",
  "tavern",
  "watchtower",
];

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaClient constructor typing doesn't expose adapter param
  const prisma = new (PrismaClient as any)({ adapter }) as PrismaClient;

  // Get first user
  const sessions = await prisma.focusSession.findFirst({ orderBy: { createdAt: "desc" } });
  let userId: string;

  if (sessions) {
    userId = sessions.userId;
    console.log(`Using userId from existing session: ${userId}`);
  } else {
    // Fallback: try to find any user from other tables
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      console.error("No users found in the database. Please log in first.");
      process.exit(1);
    }
    userId = workspace.userId;
    console.log(`Using userId from workspace: ${userId}`);
  }

  // Clear existing village buildings for this user
  const deleted = await prisma.villageBuilding.deleteMany({ where: { userId } });
  console.log(`Cleared ${deleted.count} existing buildings`);

  // Insert 10 buildings
  for (let i = 0; i < BUILDINGS.length; i++) {
    const { x, z, rotation } = getSpiralPosition(i);
    const building = await prisma.villageBuilding.create({
      data: {
        userId,
        buildingType: BUILDINGS[i],
        gridIndex: i,
        positionX: x,
        positionZ: z,
        rotation,
      },
    });
    console.log(`  #${i} ${BUILDINGS[i].padEnd(12)} → (${x.toFixed(1)}, ${z.toFixed(1)}) id=${building.id.slice(0, 8)}`);
  }

  console.log(`\nSeeded ${BUILDINGS.length} buildings!`);

  // Also make sure there are enough completed sessions to unlock tiers
  const completedCount = await prisma.focusSession.count({
    where: { userId, status: "completed" },
  });
  console.log(`User has ${completedCount} completed sessions`);

  if (completedCount < 20) {
    const needed = 20 - completedCount;
    console.log(`Creating ${needed} dummy completed sessions to unlock all tiers...`);
    for (let i = 0; i < needed; i++) {
      await prisma.focusSession.create({
        data: {
          userId,
          biome: "village",
          duration: 1500,
          elapsed: 1500,
          status: "completed",
          completedAt: new Date(Date.now() - (needed - i) * 86400000), // spread across past days
        },
      });
    }
    console.log(`Created ${needed} sessions. All tiers unlocked!`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
