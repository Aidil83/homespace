import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.problemCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      problems: {
        where: { isPublished: true },
        select: {
          id: true,
          userProgress: {
            where: { userId: user.id },
            select: { status: true },
          },
        },
      },
    },
  });

  const result = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    totalProblems: cat.problems.length,
    solvedProblems: cat.problems.filter((p) =>
      p.userProgress.some((up) => up.status === "solved")
    ).length,
  }));

  return NextResponse.json(result);
}
