import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import fs from "fs";
import path from "path";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as PrismaClient;

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

interface ProblemData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: Prisma.InputJsonValue;
  constraints: Prisma.InputJsonValue;
  starterCode: Prisma.InputJsonValue;
  testCases: Prisma.InputJsonValue;
  hints: Prisma.InputJsonValue;
  functionName: string;
  sortOrder: number;
}

async function main() {
  console.log("Seeding DSA problems...\n");

  // Load and upsert categories
  const categoriesPath = path.join(__dirname, "data", "categories.json");
  const categories: CategoryData[] = JSON.parse(
    fs.readFileSync(categoriesPath, "utf-8")
  );

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const result = await prisma.problemCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.slug, result.id);
    console.log(`  Category: ${cat.name}`);
  }

  // Load and upsert problems from each category file
  const problemsDir = path.join(__dirname, "data", "problems");
  const files = fs.readdirSync(problemsDir).filter((f) => f.endsWith(".json"));

  let totalProblems = 0;

  for (const file of files) {
    const categorySlug = file.replace(".json", "");
    const categoryId = categoryMap.get(categorySlug);

    if (!categoryId) {
      console.warn(`  Warning: No category found for ${categorySlug}, skipping.`);
      continue;
    }

    const problems: ProblemData[] = JSON.parse(
      fs.readFileSync(path.join(problemsDir, file), "utf-8")
    );

    for (const problem of problems) {
      await prisma.problem.upsert({
        where: { slug: problem.slug },
        update: {
          categoryId,
          title: problem.title,
          difficulty: problem.difficulty,
          description: problem.description,
          examples: problem.examples,
          constraints: problem.constraints,
          starterCode: problem.starterCode,
          testCases: problem.testCases,
          hints: problem.hints,
          functionName: problem.functionName,
          sortOrder: problem.sortOrder,
        },
        create: {
          categoryId,
          title: problem.title,
          slug: problem.slug,
          difficulty: problem.difficulty,
          description: problem.description,
          examples: problem.examples,
          constraints: problem.constraints,
          starterCode: problem.starterCode,
          testCases: problem.testCases,
          hints: problem.hints,
          functionName: problem.functionName,
          sortOrder: problem.sortOrder,
        },
      });
      totalProblems++;
    }

    console.log(`  Loaded ${problems.length} problems from ${file}`);
  }

  console.log(`\nDone! Seeded ${categories.length} categories and ${totalProblems} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
