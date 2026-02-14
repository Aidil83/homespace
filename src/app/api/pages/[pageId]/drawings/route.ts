import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// POST /api/pages/:pageId/drawings — create a new drawing block
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the highest sort order
  const lastBlock = await prisma.block.findFirst({
    where: { pageId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const sortOrder = (lastBlock?.sortOrder ?? 0) + 1;

  // Create a drawing block with an associated drawing record
  const block = await prisma.block.create({
    data: {
      pageId,
      type: "drawing",
      sortOrder,
      content: {},
      drawing: {
        create: {
          tldrawDocument: {},
        },
      },
    },
    include: { drawing: true },
  });

  return NextResponse.json(block);
}

// GET /api/pages/:pageId/drawings — list all drawings on a page
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drawings = await prisma.block.findMany({
    where: { pageId, type: "drawing" },
    orderBy: { sortOrder: "asc" },
    include: { drawing: true },
  });

  return NextResponse.json(drawings);
}
