import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// GET /api/pages — list all pages for the user's workspace
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create default workspace
  let workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: user.id, name: "My Workspace" },
    });
  }

  const pages = await prisma.page.findMany({
    where: { workspaceId: workspace.id, isArchived: false },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      icon: true,
      parentId: true,
      sortOrder: true,
    },
  });

  return NextResponse.json(pages);
}

// POST /api/pages — create a new page
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, parentId } = body;

  let workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: user.id, name: "My Workspace" },
    });
  }

  const page = await prisma.page.create({
    data: {
      workspaceId: workspace.id,
      title: title || "Untitled",
      parentId: parentId || null,
    },
  });

  return NextResponse.json(page);
}
