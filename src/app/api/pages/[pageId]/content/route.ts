import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// GET /api/pages/:pageId/content — get page content (blocks as JSON)
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

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      blocks: {
        where: { type: "blocknote-document" },
        take: 1,
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Return the BlockNote document content from the first block, or empty
  const docBlock = page.blocks[0];
  return NextResponse.json({ content: docBlock?.content ?? null });
}

// PUT /api/pages/:pageId/content — save page content
export async function PUT(
  request: Request,
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

  const { content } = await request.json();

  // Upsert: find existing blocknote-document block or create one
  const existing = await prisma.block.findFirst({
    where: { pageId, type: "blocknote-document" },
  });

  if (existing) {
    await prisma.block.update({
      where: { id: existing.id },
      data: { content },
    });
  } else {
    await prisma.block.create({
      data: {
        pageId,
        type: "blocknote-document",
        content,
      },
    });
  }

  return NextResponse.json({ success: true });
}
